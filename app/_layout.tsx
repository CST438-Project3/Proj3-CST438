import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import * as Sentry from '@sentry/react-native';
import { ThemeProvider } from '@/lib/ThemeContext';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

Sentry.init({
  dsn: 'https://e41dd0c787af3b672353a2fa05b9c564@o4509117947510784.ingest.us.sentry.io/4509117952688128',
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
      maskAllVectors: true,
    }),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: __DEV__,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isSignupPage = segments[0] === 'signup';
    const isResetPasswordPage = segments[0] === 'reset-password';
    const isUpdatePasswordPage = segments[0] === 'update-password';

    if (!session && !inAuthGroup && !isSignupPage && !isResetPasswordPage && !isUpdatePasswordPage) {
      // Redirect to the login page if not authenticated and not on signup, reset password, or update password page
      router.replace('/login');
    } else if (
      session &&
      !inTabsGroup &&
      !segments[0]?.startsWith('plants') // ✅ allow access to /plants/*
    ) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);
}

function RootLayoutNav() {
  useProtectedRoute();
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password-callback" options={{ headerShown: false }} />
        <Stack.Screen name="update-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="plants/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default Sentry.wrap(function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
});