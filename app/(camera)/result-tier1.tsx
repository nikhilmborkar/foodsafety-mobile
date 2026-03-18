import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EvaluateResponse, Profile } from '../../types';
import { MemberResult } from '../../types/verdict';
import { mapToMemberResults } from '../../lib/mapToMemberResults';
import { VerdictCard } from '../../components/VerdictCard';
import { SafeScreen } from '../../components/SafeScreen';
import { WarningIcon } from '../../components/icons';
import { BackButton } from '../../components/BackButton';

type Params = {
  data?: string;
  source?: string;
};

export default function ResultTier1Screen() {
  const { data, source } = useLocalSearchParams<Params>();
  const router = useRouter();
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [hasLowConfidence, setHasLowConfidence] = useState(false);
  const [scanLogId, setScanLogId] = useState<number | null>(null);
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!data) return;
    let result: EvaluateResponse;
    try {
      result = JSON.parse(data) as EvaluateResponse;
    } catch {
      setParseError(true);
      return;
    }

    setProductName(result.product_name ?? '');
    setProductId(result.product_id ?? '');
    setScanLogId(result.scan_log_id ?? null);
    setHasLowConfidence(
      (Array.isArray(result.evaluations) ? result.evaluations : []).some(e => e.Confidence_Score < 50)
    );

    AsyncStorage.getItem('household_profiles')
      .then(raw => {
        const profiles: Profile[] = raw ? (JSON.parse(raw) as Profile[]) : [];
        setMemberResults(mapToMemberResults(result, profiles));
      })
      .catch(() => {
        setMemberResults(mapToMemberResults(result, []));
      });
  }, [data]);

  if (!data || parseError) {
    return (
      <SafeScreen edges={['top']}>
        <Text style={styles.errorText}>No result data.</Text>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => router.replace('/')}>
          <Text style={styles.scanAgainText}>Scan another</Text>
        </TouchableOpacity>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top']}>
      <FlatList
        data={memberResults}
        keyExtractor={item => item.memberId}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <BackButton variant="light" onPress={() => router.replace('/')} />
              <View style={styles.headerText}>
                <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
                {productId ? (
                  <Text style={styles.productId}>Barcode: {productId.replace(/^OFF-/, '')}</Text>
                ) : null}
                {source === 'ocr_label' && (
                  <Text style={styles.ocrBadge}>📷 Scanned from label</Text>
                )}
              </View>
            </View>

            {/* Low confidence banner */}
            {hasLowConfidence && (
              <View style={styles.banner}>
                <View style={styles.bannerHeader}>
                  <View style={{ marginRight: 6 }}>
                    <WarningIcon size={13} color="#64748B" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.bannerTitle}>Limited ingredient data</Text>
                </View>
                <Text style={styles.bannerBody}>
                  {'Results may be incomplete.\nConfirm the product label before consuming.'}
                </Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>HOUSEHOLD RESULTS</Text>
          </>
        }
        renderItem={({ item }) => (
          <VerdictCard
            member={item}
            onPress={
              item.verdict === 'WARN'
                ? () =>
                    router.push({
                      pathname: '/result',
                      params: { data, source },
                    })
                : undefined
            }
          />
        )}
        ListFooterComponent={
          <>
            <Text style={styles.disclaimer}>
              Based on available product data and your household profiles. Always check the label before consuming.
            </Text>

            <TouchableOpacity
              style={styles.fullResultsBtn}
              onPress={() => router.push({ pathname: '/result', params: { data, source } })}
            >
              <Text style={styles.fullResultsText}>View full results</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.scanAgainBtn} onPress={() => router.replace('/')}>
              <Text style={styles.scanAgainText}>Scan another</Text>
            </TouchableOpacity>
          </>
        }
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  productName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  productId: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  ocrBadge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  banner: {
    backgroundColor: '#F6EFE4',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bannerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 16,
  },
  bannerBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  disclaimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  fullResultsBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  fullResultsText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0F172A',
  },
  scanAgainBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  scanAgainText: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 15,
    color: '#F3E9DA',
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#BE123C',
    textAlign: 'center',
    margin: 24,
  },
});
