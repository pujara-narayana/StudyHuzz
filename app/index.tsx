import { Redirect } from 'expo-router';

// Default route: always redirect to the discover tab.
// The AuthGuard in _layout.tsx will bounce unauthenticated users
// back to login if needed (or straight through in DEV_MODE).
export default function Index() {
  return <Redirect href="/(tabs)/discover" />;
}
