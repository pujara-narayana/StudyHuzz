import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, GENDERS, YEARS, MAJORS } from '../../lib/constants';
import OnboardingProgress from '../../components/OnboardingProgress';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Step1Basics() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [showMajorList, setShowMajorList] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredMajors = MAJORS.filter((m) =>
    m.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const isValid = name.trim() && age && gender && year && major &&
    Number(age) >= 17 && Number(age) <= 35;

  async function handleNext() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      age: Number(age),
      gender,
      year,
      major,
      intent: 'study_and_connect', // default, overridden in step3
      is_onboarded: false,
    });

    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    router.push('/(onboarding)/step2-photos');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingProgress step={1} total={4} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>The Basics</Text>
        <Text style={styles.subheading}>Tell us a bit about yourself</Text>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your first name"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Age */}
        <View style={styles.field}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="17 – 35"
            placeholderTextColor={COLORS.textSecondary}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={2}
          />
          {age && (Number(age) < 17 || Number(age) > 35) && (
            <Text style={styles.errorText}>Age must be between 17 and 35</Text>
          )}
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.pill, gender === g && styles.pillActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Year */}
        <View style={styles.field}>
          <Text style={styles.label}>Year</Text>
          <View style={styles.pillRow}>
            {YEARS.map((y) => (
              <TouchableOpacity
                key={y}
                style={[styles.pill, year === y && styles.pillActive]}
                onPress={() => setYear(y)}
              >
                <Text style={[styles.pillText, year === y && styles.pillTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Major */}
        <View style={styles.field}>
          <Text style={styles.label}>Major</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowMajorList(!showMajorList)}
          >
            <Text style={major ? styles.inputText : styles.inputPlaceholder}>
              {major || 'Search or select your major'}
            </Text>
          </TouchableOpacity>
          {showMajorList && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.dropdownSearch}
                placeholder="Search majors…"
                placeholderTextColor={COLORS.textSecondary}
                value={majorSearch}
                onChangeText={setMajorSearch}
                autoFocus
              />
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {filteredMajors.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMajor(m);
                      setShowMajorList(false);
                      setMajorSearch('');
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isValid || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Next</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 28 },
  field: { marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  inputText: { color: COLORS.textPrimary, fontSize: 16 },
  inputPlaceholder: { color: COLORS.textSecondary, fontSize: 16 },
  errorText: { color: COLORS.secondary, fontSize: 12, marginTop: 4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { color: COLORS.textSecondary, fontSize: 13 },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  dropdown: {
    marginTop: 4,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dropdownSearch: {
    padding: 12,
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText: { color: COLORS.textPrimary, fontSize: 15 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
