import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { COLOURS } from '../constants/colours';

function ScanIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 20, color }}>⬛</Text>;
}

function HouseholdIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 20, color }}>👥</Text>;
}

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLOURS.SURFACE,
          borderTopColor: COLOURS.BORDER,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: COLOURS.PRIMARY,
        tabBarInactiveTintColor: COLOURS.TEXT_FAINT,
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
          tabBarIcon: ({ color }) => <HouseholdIcon color={color} />,
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
