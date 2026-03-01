import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../lib/constants';

interface Props {
  step: number;
  total: number;
}

export default function OnboardingProgress({ step, total }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Step {step} of {total}</Text>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.segment, i < step && styles.active]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 16, gap: 8 },
  label: { color: COLORS.textSecondary, fontSize: 13 },
  track: { flexDirection: 'row', gap: 6 },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  active: { backgroundColor: COLORS.primary },
});
