import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS, PROMPT_QUESTIONS } from '../../lib/constants';
import { Prompt } from '../../types';
import OnboardingProgress from '../../components/OnboardingProgress';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMPTY_PROMPT: Prompt = { question: '', answer: '' };

export default function Step4Prompts() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([EMPTY_PROMPT, EMPTY_PROMPT, EMPTY_PROMPT]);
  const [showQPicker, setShowQPicker] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function setQuestion(i: number, q: string) {
    const updated = [...prompts];
    updated[i] = { ...updated[i], question: q };
    setPrompts(updated);
    setShowQPicker(null);
  }

  function setAnswer(i: number, a: string) {
    const updated = [...prompts];
    updated[i] = { ...updated[i], answer: a };
    setPrompts(updated);
  }

  async function save(includePrompts: boolean) {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const filledPrompts = includePrompts
      ? prompts.filter((p) => p.question && p.answer.trim())
      : [];

    const { error } = await supabase
      .from('profiles')
      .update({ prompts: filledPrompts, is_onboarded: true })
      .eq('id', user.id);

    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }

    // Redirect to schedule tab with first-time prompt
    router.replace('/(tabs)/schedule');
  }

  const usedQuestions = prompts.map((p) => p.question).filter(Boolean);
  const availableForSlot = (i: number) =>
    PROMPT_QUESTIONS.filter(
      (q) => !usedQuestions.includes(q) || prompts[i].question === q
    );

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingProgress step={4} total={4} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Show Your Personality</Text>
        <Text style={styles.subheading}>Optional — but it helps you get more matches!</Text>

        {prompts.map((p, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.slotLabel}>Prompt {i + 1}</Text>

            <TouchableOpacity
              style={styles.questionPicker}
              onPress={() => setShowQPicker(showQPicker === i ? null : i)}
            >
              <Text style={p.question ? styles.questionText : styles.questionPlaceholder}>
                {p.question || 'Choose a question…'}
              </Text>
              <Ionicons
                name={showQPicker === i ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            {showQPicker === i && (
              <View style={styles.questionList}>
                {availableForSlot(i).map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={styles.questionOption}
                    onPress={() => setQuestion(i, q)}
                  >
                    <Text style={styles.questionOptionText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {p.question ? (
              <TextInput
                style={styles.answerInput}
                placeholder="Your answer…"
                placeholderTextColor={COLORS.textSecondary}
                value={p.answer}
                onChangeText={(v) => setAnswer(i, v)}
                multiline
                maxLength={150}
              />
            ) : null}
          </View>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={() => save(true)}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Finish & Find Study Partners</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => save(false)}
          disabled={loading}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingBottom: 60 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 28 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  questionPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionText: { color: COLORS.textPrimary, fontSize: 14, flex: 1 },
  questionPlaceholder: { color: COLORS.textSecondary, fontSize: 14, flex: 1 },
  questionList: {
    marginTop: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    maxHeight: 200,
  },
  questionOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  questionOptionText: { color: COLORS.textPrimary, fontSize: 14 },
  answerInput: {
    marginTop: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 70,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipBtn: { alignItems: 'center', marginTop: 16 },
  skipText: { color: COLORS.textSecondary, fontSize: 14 },
});
