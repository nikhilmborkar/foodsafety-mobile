import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { COLOURS } from '../constants/colours';

SplashScreen.preventAutoHideAsync();

function ScanIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, lineHeight: 28, color }}>⬛</Text>;
}


function SettingsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, lineHeight: 28, color }}>⚙</Text>;
}

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Fraunces_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#A3B18A',
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: insets.bottom + 12,
          height: 68 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: 'rgba(15,23,42,0.4)',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <ScanIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: 'Household',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, lineHeight: 28, color }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="scan-label"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
