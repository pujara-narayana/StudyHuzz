import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Alert, ActivityIndicator, TextInput, Modal, FlatList,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, INTENTS, PROMPT_QUESTIONS, MAJORS, YEARS, GENDERS } from '../../lib/constants';
import { StudyWindow } from '../../types';
import IntentBadge from '../../components/IntentBadge';
import { formatTime } from '../../lib/matching';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, refreshProfile } = useAuth();
  const [windows, setWindows] = useState<StudyWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editIntent, setEditIntent] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editGender, setEditGender] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchWindows();
    }, [profile?.id])
  );

  async function fetchWindows() {
    if (!profile?.id) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('study_windows')
      .select('*')
      .eq('user_id', profile.id)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5);
    setWindows(data ?? []);
  }

  function openEditModal() {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio ?? '');
    setEditIntent(profile.intent);
    setEditMajor(profile.major);
    setEditYear(profile.year);
    setEditGender(profile.gender);
    setEditModalVisible(true);
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name: editName.trim(),
      bio: editBio.trim(),
      intent: editIntent,
      major: editMajor,
      year: editYear,
      gender: editGender,
    }).eq('id', profile.id);
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    await refreshProfile();
    setEditModalVisible(false);
  }

  async function addPhoto() {
    if (!profile) return;
    if ((profile.photos ?? []).length >= 6) {
      Alert.alert('Max photos', 'You already have 6 photos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const uri = result.assets[0].uri;
      const ext = uri.split('.').pop() ?? 'jpg';
      const fileName = `${profile.id}/${Date.now()}.${ext}`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, { contentType: `image/${ext}` });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

      const newPhotos = [...(profile.photos ?? []), urlData.publicUrl];
      await supabase.from('profiles').update({ photos: newPhotos }).eq('id', profile.id);
      await refreshProfile();
    } catch (err: any) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={openEditModal} style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
          {(profile.photos ?? []).map((p, i) => (
            <Image key={i} source={{ uri: p }} style={styles.photo} />
          ))}
          {(profile.photos ?? []).length < 6 && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={addPhoto}>
              {uploadingPhoto
                ? <ActivityIndicator color={COLORS.primary} />
                : <Ionicons name="add" size={28} color={COLORS.textSecondary} />}
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <Text style={styles.sub}>{profile.year} · {profile.major}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          <IntentBadge intent={profile.intent} />
        </View>

        {/* Study Windows */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Study Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
              <Text style={styles.sectionLink}>Edit Schedule</Text>
            </TouchableOpacity>
          </View>
          {windows.length === 0 ? (
            <Text style={styles.emptyText}>No sessions scheduled</Text>
          ) : (
            windows.map((w) => (
              <View key={w.id} style={styles.windowRow}>
                <Ionicons name="book-outline" size={14} color={COLORS.primary} />
                <Text style={styles.windowText}>
                  {new Date(w.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}{formatTime(w.start_time)}–{formatTime(w.end_time)}
                  {' · '}{w.building_id}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Prompts */}
        {(profile.prompts ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            {profile.prompts.map((p, i) => (
              <View key={i} style={styles.promptCard}>
                <Text style={styles.promptQ}>{p.question}</Text>
                <Text style={styles.promptA}>{p.answer}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.secondary} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.fieldLabel}>Bio (optional)</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={editBio}
              onChangeText={setEditBio}
              multiline
              placeholder="Tell others about yourself…"
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.fieldLabel}>Year</Text>
            <View style={styles.pillRow}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.pill, editYear === y && styles.pillActive]}
                  onPress={() => setEditYear(y)}
                >
                  <Text style={[styles.pillText, editYear === y && styles.pillTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Intent</Text>
            {INTENTS.map((intent) => (
              <TouchableOpacity
                key={intent.value}
                style={[styles.intentOption, editIntent === intent.value && { borderColor: intent.color }]}
                onPress={() => setEditIntent(intent.value)}
              >
                <Ionicons name={intent.icon as any} size={18} color={intent.color} />
                <Text style={[styles.intentOptionText, editIntent === intent.value && { color: intent.color }]}>
                  {intent.label}
                </Text>
                {editIntent === intent.value && <Ionicons name="checkmark-circle" size={18} color={intent.color} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={saveProfile}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 60, gap: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  editBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  photoRow: { gap: 10 },
  photo: { width: 100, height: 134, borderRadius: 14, backgroundColor: COLORS.surface },
  addPhotoBtn: {
    width: 100,
    height: 134,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  sub: { fontSize: 15, color: COLORS.textSecondary },
  bio: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  section: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  sectionLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  emptyText: { fontSize: 13, color: COLORS.textSecondary },
  windowRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  windowText: { fontSize: 13, color: COLORS.textSecondary, flex: 1, lineHeight: 18 },
  promptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptQ: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 4 },
  promptA: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.secondary + '44',
    backgroundColor: COLORS.secondary + '11',
  },
  signOutText: { color: COLORS.secondary, fontSize: 15, fontWeight: '600' },
  // Modal
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  modalContent: { padding: 20, gap: 12, paddingBottom: 60 },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { color: COLORS.textSecondary, fontSize: 13 },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  intentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intentOptionText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
