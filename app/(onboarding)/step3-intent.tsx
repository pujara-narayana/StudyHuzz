import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS, INTENTS } from '../../lib/constants';
import { Intent } from '../../types';
import OnboardingProgress from '../../components/OnboardingProgress';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Step3Intent() {
  const router = useRouter();
  const [selected, setSelected] = useState<Intent | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    if (!selected) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error } = await supabase
      .from('profiles')
      .update({ intent: selected })
      .eq('id', user.id);

    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    router.push('/(onboarding)/step4-prompts');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingProgress step={3} total={4} />
      <View style={styles.content}>
        <Text style={styles.heading}>What Are You Looking For?</Text>
        <Text style={styles.subheading}>
          This helps us match you with compatible study partners
        </Text>

        <View style={styles.cards}>
          {INTENTS.map((intent) => {
            const active = selected === intent.value;
            return (
              <TouchableOpacity
                key={intent.value}
                style={[styles.card, active && { borderColor: intent.color, borderWidth: 2 }]}
                onPress={() => setSelected(intent.value)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: intent.color + '22' }]}>
                  <Ionicons name={intent.icon as any} size={28} color={intent.color} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardLabel}>{intent.label}</Text>
                  <Text style={styles.cardDesc}>{intent.description}</Text>
                </View>
                {active && (
                  <Ionicons name="checkmark-circle" size={22} color={intent.color} style={styles.checkmark} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!selected || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Next</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 24 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 28 },
  cards: { flex: 1, gap: 14 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  checkmark: { marginLeft: 'auto' },
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
