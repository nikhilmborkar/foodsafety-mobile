import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';

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
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#2B6CB0',
        tabBarInactiveTintColor: '#A0AEC0',
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
        name="result"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
