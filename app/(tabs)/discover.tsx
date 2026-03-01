import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Modal, ScrollView, Image, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useMatching } from '../../hooks/useMatching';
import { COLORS, CITY_CAMPUS_BUILDINGS, EAST_CAMPUS_BUILDINGS, MAJORS, YEARS } from '../../lib/constants';
import { ProfileWithWindows } from '../../types';
import SwipeCard from '../../components/SwipeCard';
import IntentBadge from '../../components/IntentBadge';
import { formatTime, formatDate } from '../../lib/matching';

const { width, height } = Dimensions.get('window');

export default function DiscoverScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { candidates, loading, matchResult, loadCandidates, swipeRight, swipeLeft, clearMatchResult } = useMatching(
    user?.id ?? '',
    profile?.intent ?? 'study_and_connect'
  );

  const swiperRef = useRef<any>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [expandedProfile, setExpandedProfile] = useState<ProfileWithWindows | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<{
    campus?: string; building?: string; majors?: string[]; years?: string[];
  }>({});
  const [matchAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (user?.id && profile?.intent) loadCandidates();
  }, [user?.id, profile?.intent]);

  useEffect(() => {
    if (!profile?.is_onboarded) return;
    // If user has no windows, show empty state handled below
  }, []);

  // Match animation
  useEffect(() => {
    if (matchResult?.matched) {
      Animated.spring(matchAnim, { toValue: 1, useNativeDriver: true }).start();
    } else {
      matchAnim.setValue(0);
    }
  }, [matchResult]);

  const onSwipeRight = useCallback(
    (i: number) => {
      const p = candidates[i];
      if (p) swipeRight(p.id, p);
      setCardIndex(i + 1);
    },
    [candidates, swipeRight]
  );

  const onSwipeLeft = useCallback(
    (i: number) => {
      const p = candidates[i];
      if (p) swipeLeft(p.id);
      setCardIndex(i + 1);
    },
    [candidates, swipeLeft]
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  const noWindows = false; // determined server-side
  const noCandidates = !loading && candidates.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="school" size={22} color={COLORS.primary} />
          <Text style={styles.logo}>StudyHuzz</Text>
        </View>
        <TouchableOpacity onPress={() => setFiltersVisible(true)} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Finding study partners…</Text>
        </View>
      ) : noCandidates ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>📚</Text>
          <Text style={styles.emptyTitle}>No matches found</Text>
          <Text style={styles.emptyText}>
            Add more study windows or check back later!
          </Text>
          <TouchableOpacity
            style={styles.addWindowBtn}
            onPress={() => router.push('/(tabs)/schedule')}
          >
            <Text style={styles.addWindowBtnText}>Add Study Windows</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={candidates}
            cardIndex={cardIndex}
            renderCard={(p: ProfileWithWindows) => (
              <SwipeCard
                profile={p}
                onExpand={() => setExpandedProfile(p)}
              />
            )}
            onSwipedRight={onSwipeRight}
            onSwipedLeft={onSwipeLeft}
            onSwipedAll={() => setCardIndex(candidates.length)}
            backgroundColor="transparent"
            stackSize={3}
            stackScale={8}
            stackSeparation={14}
            animateCardOpacity
            overlayLabels={{
              left: {
                title: 'PASS',
                style: {
                  label: { fontSize: 32, fontWeight: '700', color: COLORS.secondary, borderColor: COLORS.secondary, borderWidth: 3, borderRadius: 8, padding: 6 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 },
                },
              },
              right: {
                title: 'STUDY',
                style: {
                  label: { fontSize: 32, fontWeight: '700', color: COLORS.success, borderColor: COLORS.success, borderWidth: 3, borderRadius: 8, padding: 6 },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 },
                },
              },
            }}
            infinite={false}
            cardVerticalMargin={0}
          />

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.passBtn]}
              onPress={() => swiperRef.current?.swipeLeft()}
            >
              <Ionicons name="close" size={28} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.likeBtn]}
              onPress={() => swiperRef.current?.swipeRight()}
            >
              <Ionicons name="checkmark" size={28} color={COLORS.success} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Match Animation Overlay */}
      {matchResult?.matched && (
        <View style={styles.matchOverlay}>
          <Animated.View style={[styles.matchContent, { opacity: matchAnim, transform: [{ scale: matchAnim }] }]}>
            <Text style={styles.matchTitle}>It's a StudyHuzz Match! 🎉</Text>

            <View style={styles.matchPhotos}>
              <Image
                source={{ uri: profile.photos?.[0] ?? 'https://randomuser.me/api/portraits/lego/1.jpg' }}
                style={styles.matchPhoto}
              />
              <View style={styles.matchHeart}>
                <Ionicons name="school" size={24} color="#fff" />
              </View>
              <Image
                source={{ uri: matchResult.profile?.photos?.[0] ?? 'https://randomuser.me/api/portraits/lego/2.jpg' }}
                style={styles.matchPhoto}
              />
            </View>

            <View style={styles.icebreakerBox}>
              <Text style={styles.icebreakerText}>{matchResult.icebreaker}</Text>
            </View>

            <View style={styles.matchActions}>
              <TouchableOpacity
                style={styles.matchMsgBtn}
                onPress={() => {
                  clearMatchResult();
                  if (matchResult.matchId) router.push(`/chat/${matchResult.matchId}`);
                }}
              >
                <Text style={styles.matchMsgBtnText}>Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.matchKeepBtn} onPress={clearMatchResult}>
                <Text style={styles.matchKeepBtnText}>Keep Swiping</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Full Profile Modal */}
      <Modal visible={!!expandedProfile} animationType="slide" presentationStyle="pageSheet">
        {expandedProfile && (
          <SafeAreaView style={styles.profileModalSafe}>
            <View style={styles.profileModalHeader}>
              <TouchableOpacity onPress={() => setExpandedProfile(null)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Image
                source={{ uri: expandedProfile.photos?.[0] }}
                style={styles.profileModalPhoto}
                resizeMode="cover"
              />
              <View style={styles.profileModalInfo}>
                <Text style={styles.profileModalName}>
                  {expandedProfile.name}, {expandedProfile.age}
                </Text>
                <Text style={styles.profileModalSub}>
                  {expandedProfile.year} · {expandedProfile.major}
                </Text>
                <IntentBadge intent={expandedProfile.intent} />

                <Text style={styles.sectionTitle}>Study Windows</Text>
                {expandedProfile.study_windows.map((w) => (
                  <View key={w.id} style={styles.windowRow}>
                    <Ionicons name="book-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.windowText}>
                      {formatDate(w.date)} · {formatTime(w.start_time)}–{formatTime(w.end_time)}
                    </Text>
                  </View>
                ))}

                {expandedProfile.prompts?.map((p, i) => (
                  <View key={i} style={styles.promptCard}>
                    <Text style={styles.promptQ}>{p.question}</Text>
                    <Text style={styles.promptA}>{p.answer}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Filters Modal */}
      <Modal visible={filtersVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.profileModalSafe}>
          <View style={styles.profileModalHeader}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary }}>Filters</Text>
            <TouchableOpacity onPress={() => setFiltersVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
            <Text style={styles.filterSectionLabel}>Campus</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['city', 'east', 'both'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.filterChip, filters.campus === c && styles.filterChipActive]}
                  onPress={() => setFilters({ ...filters, campus: filters.campus === c ? undefined : c })}
                >
                  <Text style={[styles.filterChipText, filters.campus === c && styles.filterChipTextActive]}>
                    {c === 'city' ? 'City' : c === 'east' ? 'East' : 'Both'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionLabel}>Year</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.filterChip, (filters.years ?? []).includes(y) && styles.filterChipActive]}
                  onPress={() => {
                    const cur = filters.years ?? [];
                    setFilters({
                      ...filters,
                      years: cur.includes(y) ? cur.filter((x) => x !== y) : [...cur, y],
                    });
                  }}
                >
                  <Text style={[styles.filterChipText, (filters.years ?? []).includes(y) && styles.filterChipTextActive]}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyFilterBtn}
              onPress={() => { setFiltersVisible(false); loadCandidates(filters); }}
            >
              <Text style={styles.applyFilterBtnText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setFilters({}); setFiltersVisible(false); loadCandidates(); }}
            >
              <Text style={{ color: COLORS.textSecondary, textAlign: 'center', fontSize: 14 }}>Clear Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  filterBtn: { padding: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40 },
  loadingText: { color: COLORS.textSecondary, fontSize: 15, marginTop: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  addWindowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  addWindowBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  swiperContainer: { flex: 1 },
  actions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  passBtn: { backgroundColor: COLORS.cardBg, borderWidth: 2, borderColor: COLORS.secondary },
  likeBtn: { backgroundColor: COLORS.cardBg, borderWidth: 2, borderColor: COLORS.success },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,19,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  matchContent: { width: '100%', alignItems: 'center', gap: 20 },
  matchTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  matchPhotos: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  matchPhoto: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primary },
  matchHeart: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icebreakerBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  icebreakerText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  matchActions: { width: '100%', gap: 12 },
  matchMsgBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchMsgBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  matchKeepBtn: { height: 52, justifyContent: 'center', alignItems: 'center' },
  matchKeepBtnText: { color: COLORS.textSecondary, fontSize: 15 },
  profileModalSafe: { flex: 1, backgroundColor: COLORS.background },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileModalPhoto: { width: '100%', height: 320 },
  profileModalInfo: { padding: 20, gap: 10 },
  profileModalName: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary },
  profileModalSub: { fontSize: 15, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12 },
  windowRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  windowText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  promptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptQ: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 6 },
  promptA: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  filterSectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { color: COLORS.textSecondary, fontSize: 13 },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  applyFilterBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyFilterBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
