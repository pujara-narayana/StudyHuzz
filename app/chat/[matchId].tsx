import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { COLORS } from '../../lib/constants';
import { Profile, Match } from '../../types';
import ChatBubble from '../../components/ChatBubble';
import { formatTime, formatDate } from '../../lib/matching';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat(matchId, user?.id ?? '');

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [showStudyDetails, setShowStudyDetails] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!matchId || !user?.id) return;
    fetchMatchAndProfile();
  }, [matchId, user?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  async function fetchMatchAndProfile() {
    const { data: m } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!m) return;
    setMatch(m);

    const otherId = m.user1_id === user?.id ? m.user2_id : m.user1_id;
    const { data: p } = await supabase.from('profiles').select('*').eq('id', otherId).single();
    setOtherProfile(p);
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input.trim());
    setInput('');
    setSending(false);
  }

  const mw = match?.matched_window as any;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {otherProfile && (
          <Image
            source={{ uri: otherProfile.photos?.[0] ?? 'https://randomuser.me/api/portraits/lego/1.jpg' }}
            style={styles.headerAvatar}
          />
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherProfile?.name ?? '…'}</Text>
          <Text style={styles.headerSub}>{otherProfile?.major}</Text>
        </View>

        {mw && (
          <TouchableOpacity onPress={() => setShowStudyDetails(true)} style={styles.studyDetailsBtn}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.studyDetailsBtnText}>Session</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <ChatBubble message={item} isOwn={item.sender_id === user?.id} />
            )}
            contentContainerStyle={{ paddingVertical: 12 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={COLORS.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Ionicons name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Study Details Modal */}
      <Modal visible={showStudyDetails} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.detailsSafe}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Study Session Details</Text>
            <TouchableOpacity onPress={() => setShowStudyDetails(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          {mw && (
            <ScrollView contentContainerStyle={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{formatDate(mw.date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {formatTime(mw.start_time)} – {formatTime(mw.end_time)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {mw.building_id} ({mw.campus === 'city' ? 'City Campus' : 'East Campus'})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="book-outline" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{mw.subjects?.join(', ')}</Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textSecondary },
  studyDetailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  studyDetailsBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  detailsSafe: { flex: 1, backgroundColor: COLORS.background },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailsTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  detailsContent: { padding: 20, gap: 18 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailText: { fontSize: 15, color: COLORS.textPrimary, flex: 1, lineHeight: 22 },
});
