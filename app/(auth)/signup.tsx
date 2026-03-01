import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill out all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Please make sure your passwords match.');
      return;
    }

    setLoading(true);

    // Create the account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signUpError) {
      setLoading(false);
      Alert.alert('Sign up failed', signUpError.message);
      return;
    }

    // If Supabase returned a session immediately (email confirmation disabled),
    // the auth listener in _layout.tsx will redirect automatically.
    // If not, sign in right away to get a session without waiting for email.
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setLoading(false);
        // Email confirmation is still required — guide the user
        Alert.alert(
          'Check your email',
          'A confirmation link was sent to ' + email.trim() + '. Open it on your phone, then come back and log in.\n\nTip: Disable "Confirm email" in your Supabase dashboard → Authentication → Providers → Email to skip this during testing.',
        );
        return;
      }
    }

    setLoading(false);
    // Auth state change in _layout.tsx handles redirect to onboarding
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <Ionicons name="school" size={36} color={COLORS.primary} />
          <Text style={styles.logoText}>StudyHuzz</Text>
        </View>
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.subheading}>Use any email to test the app</Text>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password (min 8 characters)"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingRight: 14 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={COLORS.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Log In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  logoText: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary },
  heading: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 32 },
  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
