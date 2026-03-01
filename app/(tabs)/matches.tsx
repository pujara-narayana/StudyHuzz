import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../lib/constants';
import { Match, Profile, Message, MatchWithProfile } from '../../types';
import MatchCard from '../../components/MatchCard';

export default function MatchesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchMatches();

    // Subscribe to new messages for badge updates
    const channel = supabase
      .channel('matches-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMatches();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  async function fetchMatches() {
    if (!user?.id) return;
    setLoading(true);

    const { data: rawMatches } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!rawMatches?.length) { setMatches([]); setLoading(false); return; }

    const enriched: MatchWithProfile[] = await Promise.all(
      rawMatches.map(async (m: Match) => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;

        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherId)
          .single();

        const { data: lastMsgArr } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', m.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...m,
          other_profile: otherProfile as Profile,
          last_message: lastMsgArr?.[0] as Message | undefined,
        };
      })
    );

    // Sort by last message time
    enriched.sort((a, b) => {
      const at = a.last_message?.created_at ?? a.created_at;
      const bt = b.last_message?.created_at ?? b.created_at;
      return new Date(bt).getTime() - new Date(at).getTime();
    });

    setMatches(enriched);
    setLoading(false);
  }

  // New matches = no messages yet (only the auto icebreaker)
  const newMatches = matches.filter((m) => m.last_message?.is_auto || !m.last_message);
  const conversations = matches.filter((m) => m.last_message && !m.last_message.is_auto || false);
  const allConversations = matches; // show all in list, new matches in bubble row

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>💬</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>Start swiping to find study partners!</Text>
        </View>
      ) : (
        <>
          {/* New Matches Row */}
          {newMatches.length > 0 && (
            <View style={styles.newMatchesSection}>
              <Text style={styles.sectionLabel}>New Matches</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newMatchRow}>
                {newMatches.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.newMatchBubble}
                    onPress={() => router.push(`/chat/${m.id}`)}
                  >
                    <Image
                      source={{ uri: m.other_profile?.photos?.[0] ?? 'https://randomuser.me/api/portraits/lego/1.jpg' }}
                      style={styles.newMatchPhoto}
                    />
                    <Text style={styles.newMatchName} numberOfLines={1}>
                      {m.other_profile?.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Conversations */}
          <FlatList
            data={allConversations}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <MatchCard
                match={item}
                onPress={() => router.push(`/chat/${item.id}`)}
              />
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: 15, color: COLORS.textSecondary },
  newMatchesSection: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, paddingHorizontal: 16, paddingBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  newMatchRow: { paddingHorizontal: 16, gap: 14 },
  newMatchBubble: { alignItems: 'center', gap: 6 },
  newMatchPhoto: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  newMatchName: { fontSize: 12, color: COLORS.textPrimary, maxWidth: 68, textAlign: 'center' },
});
