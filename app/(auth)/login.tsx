import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';

// ─── Change these to whatever test account you created ───────────────────────
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'testpassword123';
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) Alert.alert('Login failed', error.message);
  }

  function fillTestCredentials() {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Ionicons name="school" size={36} color={COLORS.primary} />
          <Text style={styles.logoText}>StudyHuzz</Text>
        </View>
        <Text style={styles.tagline}>Find your study match at UNL</Text>

        {/* Dev quick-fill banner */}
        <TouchableOpacity style={styles.devBanner} onPress={fillTestCredentials}>
          <Ionicons name="flask-outline" size={14} color={COLORS.primary} />
          <Text style={styles.devBannerText}>
            Dev mode — tap to fill test credentials
          </Text>
        </TouchableOpacity>

        {/* Form */}
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
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingRight: 14 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  logoText: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary },
  tagline: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 28 },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '18',
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 20,
  },
  devBannerText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
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
