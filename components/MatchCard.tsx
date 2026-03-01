import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MatchWithProfile } from '../types';
import { COLORS } from '../lib/constants';

interface Props {
  match: MatchWithProfile;
  onPress: () => void;
}

export default function MatchCard({ match, onPress }: Props) {
  const p = match.other_profile;
  const hasUnread = (match.unread_count ?? 0) > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: p.photos?.[0] ?? 'https://randomuser.me/api/portraits/lego/1.jpg' }}
          style={styles.avatar}
        />
        {hasUnread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, hasUnread && styles.bold]}>{p.name}</Text>
        <Text style={[styles.preview, hasUnread && styles.bold]} numberOfLines={1}>
          {match.last_message?.content ?? 'Start the conversation!'}
        </Text>
      </View>
      {match.last_message && (
        <Text style={styles.time}>
          {new Date(match.last_message.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit',
          })}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surface },
  unreadDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  info: { flex: 1 },
  name: { fontSize: 15, color: COLORS.textPrimary, marginBottom: 3 },
  preview: { fontSize: 13, color: COLORS.textSecondary },
  bold: { fontWeight: '700' },
  time: { fontSize: 11, color: COLORS.textSecondary },
});
