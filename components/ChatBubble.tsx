import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { COLORS } from '../lib/constants';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: Props) {
  if (message.is_auto) {
    return (
      <View style={styles.autoContainer}>
        <View style={styles.autoBubble}>
          <Text style={styles.autoText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.time}>
        {new Date(message.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginHorizontal: 16, marginVertical: 3, maxWidth: '80%' },
  rowOwn: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOwn: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4 },
  text: { fontSize: 15, lineHeight: 21 },
  textOwn: { color: '#fff' },
  textOther: { color: COLORS.textPrimary },
  time: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, marginHorizontal: 4 },
  autoContainer: { alignItems: 'center', marginVertical: 12, paddingHorizontal: 24 },
  autoBubble: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: '100%',
  },
  autoText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, textAlign: 'center' },
});
