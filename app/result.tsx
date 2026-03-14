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
import { COLOURS } from '../constants/colours';
import { TYPOGRAPHY } from '../constants/typography';

type ResultParams = {
  data?: string;
  state?: string;
  product_id?: string;
  product_name?: string;
  source?: string;
};

export default function ResultScreen() {
  const { data, state, product_id, product_name, source } = useLocalSearchParams<ResultParams>();
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

  if (state === 'INCONCLUSIVE') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {(product_name || product_id) && (
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {product_name ? (
                  <Text style={styles.productName}>{product_name}</Text>
                ) : null}
                {product_id ? (
                  <Text style={styles.productId}>{product_id}</Text>
                ) : null}
              </View>
            </View>
          )}

          <View style={styles.inconclusiveCard}>
            <View style={styles.inconclusiveDiamond}>
              <Text style={styles.inconclusiveDiamondText}>◆</Text>
            </View>
            <Text style={styles.inconclusiveHeadline}>Analysis incomplete</Text>
            <Text style={styles.inconclusiveBody}>
              We don't have enough ingredient data to complete this safety check.
            </Text>
          </View>

          <TouchableOpacity style={styles.inconclusivePrimaryBtn} onPress={handleScanAnother}>
            <Text style={styles.inconclusivePrimaryText}>Scan ingredient list</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inconclusiveSecondaryBtn} onPress={handleScanAnother}>
            <Text style={styles.inconclusiveSecondaryText}>Scan another product</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            {source === 'ocr_label' && (
              <Text style={styles.ocrBadge}>📷 Scanned from label</Text>
            )}
          </View>
        </View>

        {hasLowConfidence && (
          <View style={styles.lowConfidenceBanner}>
            <Text style={styles.lowConfidenceBannerText}>
              Limited product data — confirm before use
            </Text>
          </View>
        )}

        {profilesLoading ? (
          <ActivityIndicator size="large" color={COLOURS.PRIMARY} style={styles.spinner} />
        ) : (
          result.evaluations.map(evaluation => (
            <MemberCard
              key={`${evaluation.Profile_ID}-${result.scan_log_id ?? result.product_id}`}
              profileName={getProfileName(evaluation.Profile_ID)}
              evaluation={evaluation}
              scanLogId={result.scan_log_id ?? null}
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
    backgroundColor: COLOURS.BACKGROUND,
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
  productName: {
    ...TYPOGRAPHY.heading,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    fontWeight: '700',
    color: COLOURS.TEXT_PRIMARY,
  },
  productId: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLOURS.TEXT_FAINT,
    marginTop: 2,
  },
  ocrBadge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  lowConfidenceBanner: {
    backgroundColor: COLOURS.LOW_CONF_BG,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lowConfidenceBannerText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLOURS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLOURS.BLOCK,
    textAlign: 'center',
    margin: 24,
  },
  spinner: {
    marginVertical: 24,
  },
  scanAgainBtn: {
    backgroundColor: COLOURS.PRIMARY,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  scanAgainText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLOURS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  inconclusiveCard: {
    alignItems: 'center',
    backgroundColor: COLOURS.CARD_BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  inconclusiveDiamond: {
    marginBottom: 16,
  },
  inconclusiveDiamondText: {
    fontSize: 40,
    color: COLOURS.INCONCLUSIVE,
  },
  inconclusiveHeadline: {
    ...TYPOGRAPHY.heading,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    fontWeight: '700',
    color: COLOURS.TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  inconclusiveBody: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLOURS.TEXT_MID,
    textAlign: 'center',
    lineHeight: 22,
  },
  inconclusivePrimaryBtn: {
    backgroundColor: COLOURS.INCONCLUSIVE,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  inconclusivePrimaryText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLOURS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  inconclusiveSecondaryBtn: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLOURS.BORDER_SUBTLE,
  },
  inconclusiveSecondaryText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLOURS.TEXT_MID,
    fontSize: 16,
    fontWeight: '500',
  },
});
