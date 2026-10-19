import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppLifecycle } from '@core/bootstrap/use-app-lifecycle';
import { useSecureCacheStorage } from '@core/bootstrap/use-secure-cache-storage';
import { createQueryClient } from '@core/query/query-client';
import { createPersistOptions } from '@core/query/query-persister';
import { appFonts } from '@shared/theme/fonts';
import { paperTheme } from '@shared/theme/paper-theme';

void SplashScreen.preventAutoHideAsync();

const styles = { root: { flex: 1 } } as const;

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const storage = useSecureCacheStorage();
  const [cacheRestored, setCacheRestored] = useState(false);
  useAppLifecycle();

  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    // Keep the splash until saved data is back, so a cold start never flashes a spinner.
    if (fontsReady && cacheRestored) void SplashScreen.hideAsync();
  }, [fontsReady, cacheRestored]);

  if (!fontsReady || !storage) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={createPersistOptions(storage)}
            onSuccess={() => setCacheRestored(true)}
            onError={() => setCacheRestored(true)}
          >
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
          </PersistQueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
