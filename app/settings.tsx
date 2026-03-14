import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLOURS } from '../constants/colours';
import { SafeScreen } from '../components/SafeScreen';

export default function SettingsScreen() {
  return (
    <SafeScreen>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    color: COLOURS.PRIMARY,
  },
});
