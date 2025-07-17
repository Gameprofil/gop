import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import {
  Oswald_400Regular,
  Oswald_600SemiBold,
  Oswald_700Bold
} from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Oswald-Regular': Oswald_400Regular,
    'Oswald-SemiBold': Oswald_600SemiBold,
    'Oswald-Bold': Oswald_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <LanguageProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="profile-type" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="post-detail" />
            <Stack.Screen name="match-detail" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="help-faq" />
            <Stack.Screen name="privacy-policy" />
            <Stack.Screen name="player-detail" />
            <Stack.Screen name="coach-profile" />
            <Stack.Screen name="messages" />
            <Stack.Screen name="training-detail" />
            <Stack.Screen name="create-training" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="settings" />
          </Stack>
          <StatusBar style="light" backgroundColor="#000000" />
        </LanguageProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}