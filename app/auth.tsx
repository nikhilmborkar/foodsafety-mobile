import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLOURS } from '../constants/colours';
import { SafeScreen } from '../components/SafeScreen';

export default function AuthScreen() {
  const router = useRouter();
  return (
    <SafeScreen>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.body}>Account setup coming soon.</Text>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
  backBtn: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#0F172A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 8,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
});
