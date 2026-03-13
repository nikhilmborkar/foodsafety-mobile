import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import HouseholdIcon from '../components/icons/HouseholdIcon';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { COLOURS } from '../constants/colours';

SplashScreen.preventAutoHideAsync();

function ScanIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 20, color }}>⬛</Text>;
}


function SettingsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 20, color }}>⚙</Text>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
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
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#F3E9DA',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
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
          tabBarIcon: ({ color }) => <HouseholdIcon color={color} size={24} />,
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
    </Tabs>
  );
}
