import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EvaluateResponse, Profile } from '../../types';
import { MemberCard } from '../../components/MemberCard';
import { COLOURS } from '../../constants/colours';
import { TYPOGRAPHY } from '../../constants/typography';
import { SafeScreen } from '../../components/SafeScreen';
import { WarningIcon } from '../../components/icons';
import { BackButton } from '../../components/BackButton';

type ResultParams = {
  data?: string;
  state?: string;
  product_id?: string;
  product_name?: string;
  source?: string;
  inconclusive_reason?: string;
};

export default function ResultScreen() {
  const { data, state, product_id, product_name, source, inconclusive_reason } = useLocalSearchParams<ResultParams>();
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

  const incReason = (inconclusive_reason ?? '').toLowerCase();
  const incTagText =
    incReason.includes('not found') || incReason.includes('not in')
      ? 'product not in database'
      : incReason.includes('incomplete') || incReason.includes('parse') || incReason.includes('analyze')
      ? 'incomplete ingredient data'
      : 'unable to complete check';
  const incDescription =
    incReason.includes('not found') || incReason.includes('not in')
      ? "This product isn't in our database yet. Scan the ingredient label and fufu will analyse it directly."
      : incReason.includes('incomplete') || incReason.includes('parse')
      ? "We found this product but couldn't read its ingredients. Scan the label and fufu will analyse it directly."
      : "fufu couldn't complete the safety check. Scan the ingredient label for a full analysis.";

  if (state === 'INCONCLUSIVE' || (Array.isArray(state) && state[0] === 'INCONCLUSIVE')) {
    const showProductName = product_name && product_name !== 'Unknown product';
    return (
      <SafeScreen edges={['top']}>
        <ScrollView contentContainerStyle={styles.incContent}>
          {/* Header row */}
          <View style={styles.incHeaderRow}>
            <BackButton variant="light" onPress={() => router.replace('/')} />
            <Text style={styles.incBackLabel}>Back to scanner</Text>
          </View>

          {/* Product name */}
          {showProductName && (
            <Text style={styles.incProductName}>{product_name}</Text>
          )}

          {/* Status tag */}
          <View style={styles.incTagRow}>
            <View style={styles.incTagDot} />
            <Text style={styles.incTagText}>{incTagText}</Text>
          </View>

          {/* Main card */}
          <View style={styles.incCard}>
            {/* Icon ring */}
            <View style={styles.incIconRing}>
              <Text style={styles.incIconText}>!</Text>
            </View>

            <Text style={styles.incCardTitle}>Safety check incomplete</Text>
            <Text style={styles.incCardDesc}>{incDescription}</Text>

            {/* Divider */}
            <View style={styles.incDivider} />

            {/* How it works */}
            <Text style={styles.incHowLabel}>HOW IT WORKS</Text>

            {[
              'Point your camera at the ingredients list on the packaging',
              'fufu reads and analyses the text automatically',
              'You get a full safety verdict for your household',
            ].map((step, i) => (
              <View key={i} style={[styles.incStepRow, i === 2 && { marginBottom: 0 }]}>
                <View style={styles.incStepCircle}>
                  <Text style={styles.incStepNum}>{i + 1}</Text>
                </View>
                <Text style={styles.incStepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Primary CTA */}
          <TouchableOpacity style={styles.incPrimaryBtn} onPress={() => router.replace('/scan-label')}>
            <Text style={styles.incPrimaryText}>Scan ingredient list</Text>
          </TouchableOpacity>

          {/* Secondary button */}
          <TouchableOpacity style={styles.incSecondaryBtn} onPress={() => router.replace('/')}>
            <Text style={styles.incSecondaryText}>Try a different barcode</Text>
          </TouchableOpacity>

          {/* OFF contribution link */}
          <Text style={styles.incOffText}>
            {'Help improve coverage — '}
            <Text
              style={styles.incOffLink}
              onPress={() => Linking.openURL('https://world.openfoodfacts.org/product/add')}
            >
              contribute this product to Open Food Facts
            </Text>
          </Text>
        </ScrollView>
      </SafeScreen>
    );
  }

  if (!data) {
    return (
      <SafeScreen edges={['top']}>
        <Text style={styles.errorText}>No result data.</Text>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={handleScanAnother}>
          <Text style={styles.scanAgainText}>Scan another</Text>
        </TouchableOpacity>
      </SafeScreen>
    );
  }

  let result: EvaluateResponse;
  try {
    result = JSON.parse(data) as EvaluateResponse;
  } catch {
    return (
      <SafeScreen edges={['top']}>
        <Text style={styles.errorText}>Failed to parse result.</Text>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={handleScanAnother}>
          <Text style={styles.scanAgainText}>Scan another</Text>
        </TouchableOpacity>
      </SafeScreen>
    );
  }

  const hasLowConfidence = result.evaluations?.some(e => e.Confidence_Score < 50) ?? false;

  const getProfileName = (profileId: string): string => {
    const p = profiles.find(pr => pr.Profile_ID === profileId);
    return p ? p.Profile_Name : profileId;
  };

  return (
    <SafeScreen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.productName}>{result.product_name}</Text>
            <Text style={styles.productId}>Barcode: {result.product_id?.replace(/^OFF-/, '')}</Text>
            {source === 'ocr_label' && (
              <Text style={styles.ocrBadge}>📷 Scanned from label</Text>
            )}
          </View>
        </View>

        {hasLowConfidence && (
          <View style={styles.limitedDataBanner}>
            <View style={styles.limitedDataBannerHeader}>
              <View style={{ marginRight: 6 }}>
                <WarningIcon size={13} color="#64748B" strokeWidth={1.5} />
              </View>
              <Text style={styles.limitedDataBannerTitle}>
                Limited ingredient data
              </Text>
            </View>
            <Text style={styles.limitedDataBannerBody}>
              {"Results may be incomplete.\nConfirm the product label before consuming."}
            </Text>
          </View>
        )}

        {profilesLoading ? (
          <ActivityIndicator size="large" color={COLOURS.PRIMARY} style={styles.spinner} />
        ) : (
          (result.evaluations ?? []).map(evaluation => (
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
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  limitedDataBanner: {
    backgroundColor: '#F6EFE4',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  limitedDataBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  limitedDataBannerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 16,
  },
  limitedDataBannerBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
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
  // ── INCONCLUSIVE screen ──────────────────────────────────────────────
  incContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  incHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  incBackLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
    marginLeft: 0,
  },
  incProductName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 8,
  },
  incTagRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 40,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 16,
  },
  incTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 8,
  },
  incTagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  incCard: {
    backgroundColor: '#F6EFE4',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 14,
    alignItems: 'center',
  },
  incIconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#A3B18A',
    backgroundColor: '#F3E9DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  incIconText: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  incCardTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  incCardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  incDivider: {
    height: 1,
    backgroundColor: '#A3B18A',
    opacity: 0.5,
    marginBottom: 14,
    alignSelf: 'stretch',
  },
  incHowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 1.2,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  incStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  incStepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  incStepNum: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#F3E9DA',
  },
  incStepText: {
    flex: 1,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  incPrimaryBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  incPrimaryText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 15,
    color: '#F3E9DA',
  },
  incSecondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  incSecondaryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F172A',
  },
  incOffText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  incOffLink: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#334155',
    textDecorationLine: 'underline',
  },
});
