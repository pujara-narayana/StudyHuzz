import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../lib/constants';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!session) {
      // Not logged in → auth screens
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (!profile?.is_onboarded) {
      // Logged in but not onboarded
      if (!inOnboarding) router.replace('/(onboarding)/step1-basics');
    } else {
      // Fully onboarded → tabs
      if (inAuthGroup || inOnboarding) router.replace('/(tabs)/discover');
    }
  }, [session, profile, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[matchId]" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </AuthGuard>
    </GestureHandlerRootView>
  );
}
