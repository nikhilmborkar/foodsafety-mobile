import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  ScannerIcon,
  HouseholdIcon,
  SettingsIcon,
} from '../components/icons';

SplashScreen.preventAutoHideAsync();

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
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => (
            <ScannerIcon
              size={22}
              color={focused ? '#0F172A' : 'rgba(15,23,42,0.4)'}
              strokeWidth={focused ? 2 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: 'Household',
          tabBarIcon: ({ focused }) => (
            <HouseholdIcon
              size={22}
              color={focused ? '#0F172A' : 'rgba(15,23,42,0.4)'}
              strokeWidth={focused ? 2 : 1.5}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <SettingsIcon
              size={22}
              color={focused ? '#0F172A' : 'rgba(15,23,42,0.4)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="auth"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
