import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EvaluateResponse, Profile } from '../../types';
import { MemberResult } from '../../types/verdict';
import { mapToMemberResults } from '../../lib/mapToMemberResults';
import { DetailVerdictCard } from '../../components/DetailVerdictCard';
import { SafeScreen } from '../../components/SafeScreen';
import { WarningIcon } from '../../components/icons';
import { COLOURS } from '../../constants/colours';
import { TYPOGRAPHY } from '../../constants/typography';

type Params = {
  data?: string;
  source?: string;
  scrollToMemberId?: string;
};

export default function ResultTier2Screen() {
  const { data, source, scrollToMemberId } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [parseError, setParseError] = useState(false);
  const [hasLowConfidence, setHasLowConfidence] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const cardPositions = useRef<Record<string, number>>({});
  const didScrollRef = useRef(false);

  useEffect(() => {
    if (!data) return;
    let parsed: EvaluateResponse;
    try {
      parsed = JSON.parse(data) as EvaluateResponse;
    } catch {
      setParseError(true);
      return;
    }

    setResult(parsed);
    setHasLowConfidence(parsed.evaluations.some(e => e.Confidence_Score < 50));

    AsyncStorage.getItem('household_profiles')
      .then(raw => {
        const profiles: Profile[] = raw ? (JSON.parse(raw) as Profile[]) : [];
        setMemberResults(mapToMemberResults(parsed, profiles));
      })
      .catch(() => {
        setMemberResults(mapToMemberResults(parsed, []));
      });
  }, [data]);

  // Scroll to target member after cards have laid out
  useEffect(() => {
    if (!scrollToMemberId || didScrollRef.current || memberResults.length === 0) return;
    requestAnimationFrame(() => {
      const y = cardPositions.current[scrollToMemberId];
      if (y !== undefined) {
        scrollRef.current?.scrollTo({ y: y - 20, animated: true });
        didScrollRef.current = true;
      }
    });
  }, [memberResults, scrollToMemberId]);

  if (!data || parseError) {
    return (
      <SafeScreen edges={['top']}>
        <Text style={styles.errorText}>No result data.</Text>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => router.replace('/')}>
          <Text style={styles.scanAgainText}>Scan another product</Text>
        </TouchableOpacity>
      </SafeScreen>
    );
  }

  if (!result) return <SafeScreen edges={['top']}>{null}</SafeScreen>;

  const evaluationMap = Object.fromEntries(
    result.evaluations.map(e => [e.Profile_ID, e])
  );

  return (
    <SafeScreen edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backChevron}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.productName} numberOfLines={2}>
              {result.product_name}
            </Text>
            {result.product_id ? (
              <Text style={styles.productId}>
                Barcode: {result.product_id.replace(/^OFF-/, '')}
              </Text>
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
                <WarningIcon size={13} color={COLOURS.TEXT_SECONDARY} strokeWidth={1.5} />
              </View>
              <Text style={styles.bannerTitle}>Limited ingredient data</Text>
            </View>
            <Text style={styles.bannerBody}>
              {'Results may be incomplete.\nConfirm the product label before consuming.'}
            </Text>
          </View>
        )}

        {/* Member cards */}
        {memberResults.map(member => {
          const evaluation = evaluationMap[member.memberId];
          if (!evaluation) return null;
          return (
            <View
              key={member.memberId}
              onLayout={e => {
                cardPositions.current[member.memberId] = e.nativeEvent.layout.y;
              }}
            >
              <DetailVerdictCard
                member={member}
                evaluation={evaluation}
                isWarn={member.verdict === 'WARN'}
                initiallyExpanded={member.memberId === scrollToMemberId}
                scanLogId={result.scan_log_id ?? null}
              />
            </View>
          );
        })}

        {/* Footer */}
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => router.replace('/')}>
          <Text style={styles.scanAgainText}>Scan another product</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  backChevron: {
    fontSize: 18,
    color: COLOURS.TEXT_PRIMARY,
  },
  headerText: {
    flex: 1,
  },
  productName: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLOURS.TEXT_PRIMARY,
  },
  productId: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLOURS.TEXT_FAINT,
    marginTop: 2,
  },
  ocrBadge: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
    marginTop: 4,
  },
  banner: {
    backgroundColor: '#F6EFE4',
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
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
    ...TYPOGRAPHY.subheading,
    fontSize: 13,
    color: COLOURS.TEXT_SECONDARY,
    lineHeight: 16,
  },
  bannerBody: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
    lineHeight: 16,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLOURS.BLOCK,
    textAlign: 'center',
    margin: 24,
  },
  scanAgainBtn: {
    backgroundColor: COLOURS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  scanAgainText: {
    ...TYPOGRAPHY.subheading,
    fontSize: 15,
    color: '#F3E9DA',
  },
});
