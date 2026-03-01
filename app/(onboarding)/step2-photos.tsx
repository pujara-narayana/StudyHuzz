import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import OnboardingProgress from '../../components/OnboardingProgress';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 3;

export default function Step2Photos() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]); // Supabase Storage URLs
  const [uploading, setUploading] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function pickAndUpload(slot: number) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });

    if (result.canceled || !result.assets[0]) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(slot);
    try {
      const uri = result.assets[0].uri;
      const fileExt = uri.split('.').pop() ?? 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const newPhotos = [...photos];
      newPhotos[slot] = urlData.publicUrl;
      setPhotos(newPhotos);
    } catch (err: any) {
      Alert.alert('Upload failed', err.message ?? 'Please try again.');
    } finally {
      setUploading(null);
    }
  }

  function removePhoto(slot: number) {
    const newPhotos = [...photos];
    newPhotos.splice(slot, 1);
    setPhotos(newPhotos);
  }

  async function handleNext() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase
      .from('profiles')
      .update({ photos })
      .eq('id', user.id);

    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    router.push('/(onboarding)/step3-intent');
  }

  const canContinue = photos.filter(Boolean).length >= MIN_PHOTOS;

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingProgress step={2} total={4} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Add Your Photos</Text>
        <Text style={styles.subheading}>Add at least 3 photos to continue (max 6)</Text>

        <View style={styles.grid}>
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
            const photo = photos[i];
            const isUploading = uploading === i;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.slot, i === 0 && styles.slotLarge]}
                onPress={() => !isUploading && pickAndUpload(i)}
              >
                {isUploading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : photo ? (
                  <>
                    <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removePhoto(i)}
                    >
                      <Ionicons name="close-circle" size={22} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Ionicons name="add" size={28} color={COLORS.textSecondary} />
                    {i < MIN_PHOTOS && (
                      <Text style={styles.required}>Required</Text>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>
          {photos.filter(Boolean).length} / {MAX_PHOTOS} photos added
          {!canContinue ? `  ·  Need ${MIN_PHOTOS - photos.filter(Boolean).length} more` : ''}
        </Text>

        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canContinue || saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Next</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingBottom: 60 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: {
    width: '47%',
    aspectRatio: 0.75,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slotLarge: { width: '100%', aspectRatio: 1.4 },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 11,
  },
  required: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  hint: { color: COLORS.textSecondary, fontSize: 13, marginTop: 16, textAlign: 'center' },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
