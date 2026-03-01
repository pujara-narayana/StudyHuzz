import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Intent } from '../types';
import { INTENTS } from '../lib/constants';

interface Props {
  intent: Intent;
  size?: 'sm' | 'md';
}

export default function IntentBadge({ intent, size = 'md' }: Props) {
  const config = INTENTS.find((i) => i.value === intent);
  if (!config) return null;

  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '22', borderColor: config.color + '55' }]}>
      <Ionicons name={config.icon as any} size={isSmall ? 11 : 13} color={config.color} />
      <Text style={[styles.label, { color: config.color, fontSize: isSmall ? 10 : 12 }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: { fontWeight: '500' },
});
