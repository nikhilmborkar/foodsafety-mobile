import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EvaluateResponse, Profile } from '../types';
import { MemberCard } from '../components/MemberCard';

export default function ResultScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('household_profiles')
      .then(raw => {
        if (raw) setProfiles(JSON.parse(raw) as Profile[]);
      })
      .catch(() => {})
      .finally(() => setProfilesLoading(false));
  }, []);

  const handleScanAnother = () => router.replace('/');

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No result data.</Text>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={handleScanAnother}>
          <Text style={styles.scanAgainText}>Scan another</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  let result: EvaluateResponse;
  try {
    result = JSON.parse(data) as EvaluateResponse;
  } catch {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Failed to parse result.</Text>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={handleScanAnother}>
          <Text style={styles.scanAgainText}>Scan another</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const hasLowConfidence = result.evaluations.some(e => e.Confidence_Score < 50);

  const getProfileName = (profileId: string): string => {
    const p = profiles.find(pr => pr.Profile_ID === profileId);
    return p ? p.Profile_Name : profileId;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.productName}>{result.product_name}</Text>
            <Text style={styles.productId}>{result.product_id}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/profiles')}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {hasLowConfidence && (
          <View style={styles.lowConfidenceBanner}>
            <Text style={styles.lowConfidenceBannerText}>
              Limited product data — confirm before use
            </Text>
          </View>
        )}

        {profilesLoading ? (
          <ActivityIndicator size="large" color="#2B6CB0" style={styles.spinner} />
        ) : (
          result.evaluations.map(evaluation => (
            <MemberCard
              key={evaluation.Profile_ID}
              profileName={getProfileName(evaluation.Profile_ID)}
              evaluation={evaluation}
            />
          ))
        )}

        <TouchableOpacity style={styles.scanAgainBtn} onPress={handleScanAnother}>
          <Text style={styles.scanAgainText}>Scan another</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  settingsBtn: {
    padding: 4,
    marginLeft: 8,
  },
  settingsIcon: {
    fontSize: 22,
    color: '#718096',
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
  },
  productId: {
    fontSize: 13,
    color: '#A0AEC0',
    marginTop: 2,
  },
  lowConfidenceBanner: {
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lowConfidenceBannerText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    margin: 24,
  },
  spinner: {
    marginVertical: 24,
  },
  scanAgainBtn: {
    backgroundColor: '#2B6CB0',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
