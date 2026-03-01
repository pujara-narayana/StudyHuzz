import { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileWithWindows } from '../types';
import { COLORS } from '../lib/constants';
import IntentBadge from './IntentBadge';
import { formatTime, formatDate } from '../lib/matching';

const { width } = Dimensions.get('window');

interface Props {
  profile: ProfileWithWindows;
  onExpand?: () => void;
}

export default function SwipeCard({ profile, onExpand }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = profile.photos ?? [];

  function nextPhoto() {
    if (photoIndex < photos.length - 1) setPhotoIndex(photoIndex + 1);
  }
  function prevPhoto() {
    if (photoIndex > 0) setPhotoIndex(photoIndex - 1);
  }

  return (
    <View style={styles.card}>
      {/* Photo */}
      <View style={styles.photoContainer}>
        {photos.length > 0 ? (
          <Image source={{ uri: photos[photoIndex] }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="person" size={80} color={COLORS.textSecondary} />
          </View>
        )}

        {/* Photo nav tap zones */}
        <TouchableOpacity style={styles.photoLeft} onPress={prevPhoto} />
        <TouchableOpacity style={styles.photoRight} onPress={nextPhoto} />

        {/* Photo dots */}
        {photos.length > 1 && (
          <View style={styles.photoDots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Gradient overlay */}
        <View style={styles.photoGradient} />

        {/* Name/age overlay */}
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{profile.name}, {profile.age}</Text>
          <Text style={styles.yearMajor}>{profile.year} · {profile.major}</Text>
        </View>
      </View>

      {/* Info section */}
      <ScrollView style={styles.info} showsVerticalScrollIndicator={false}>
        <IntentBadge intent={profile.intent} />

        {/* Overlapping windows */}
        {(profile.overlapping_windows ?? profile.study_windows)?.slice(0, 2).map((w) => (
          <View key={w.id} style={styles.windowRow}>
            <Ionicons name="book-outline" size={14} color={COLORS.primary} />
            <Text style={styles.windowText}>
              {formatDate(w.date).split(',')[0]} · {formatTime(w.start_time)}–{formatTime(w.end_time)} · {w.building_id}
            </Text>
          </View>
        ))}

        {/* Subjects from windows */}
        {(() => {
          const allSubjects = (profile.overlapping_windows ?? profile.study_windows)
            ?.flatMap((w) => w.subjects).slice(0, 4) ?? [];
          if (!allSubjects.length) return null;
          return (
            <View style={styles.subjectRow}>
              {allSubjects.map((s) => (
                <View key={s} style={styles.subjectChip}>
                  <Text style={styles.subjectChipText}>{s}</Text>
                </View>
              ))}
            </View>
          );
        })()}

        {/* First prompt */}
        {profile.prompts?.[0] && (
          <View style={styles.promptCard}>
            <Text style={styles.promptQ}>{profile.prompts[0].question}</Text>
            <Text style={styles.promptA}>{profile.prompts[0].answer}</Text>
          </View>
        )}

        {onExpand && (
          <TouchableOpacity style={styles.expandBtn} onPress={onExpand}>
            <Text style={styles.expandBtnText}>View Full Profile</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width - 24,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '90%',
  },
  photoContainer: { height: 340, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  photoLeft: { position: 'absolute', left: 0, top: 0, width: '40%', height: '100%' },
  photoRight: { position: 'absolute', right: 0, top: 0, width: '60%', height: '100%' },
  photoDots: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    // Simulated gradient via opacity
  },
  nameOverlay: { position: 'absolute', bottom: 16, left: 16 },
  nameText: { fontSize: 26, fontWeight: '700', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  yearMajor: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  info: { padding: 16, maxHeight: 220 },
  windowRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10 },
  windowText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  subjectChip: { backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  subjectChipText: { fontSize: 12, color: COLORS.textSecondary },
  promptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptQ: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 4 },
  promptA: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center', paddingVertical: 12 },
  expandBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
});
