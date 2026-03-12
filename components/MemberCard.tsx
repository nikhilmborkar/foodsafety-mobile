import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLOURS } from '../constants/colours';
import { EvaluationOutput, UIOutcome } from '../types';
import { OutcomeBadge } from './OutcomeBadge';
import { WhyPanel } from './WhyPanel';
import { API_BASE_URL } from '../constants/api';
import { TYPOGRAPHY } from '../constants/typography';

type FlagState = 'idle' | 'sending' | 'confirmed' | 'error';

interface Props {
  profileName: string;
  evaluation: EvaluationOutput;
  scanLogId?: number | null;
}

const BG: Record<UIOutcome, string> = {
  BLOCK:        COLOURS.BLOCK,
  WARN:         COLOURS.WARN,
  ALLOW:        COLOURS.ALLOW,
  INCONCLUSIVE: COLOURS.INCONCLUSIVE,
};

const VERDICT: Record<UIOutcome, (name: string) => string> = {
  ALLOW:        (name) => `Checked for ${name} — no issues found`,
  WARN:         (name) => `Checked for ${name} — review before giving`,
  BLOCK:        (name) => `Checked for ${name} — not suitable, avoid`,
  INCONCLUSIVE: (name) => `Checked for ${name} — analysis incomplete`,
};

export function MemberCard({ profileName, evaluation, scanLogId }: Props) {
  const initial = profileName.charAt(0).toUpperCase();
  const outcomeColour = BG[evaluation.Outcome] ?? COLOURS.INCONCLUSIVE;
  const verdictText = (VERDICT[evaluation.Outcome] ?? VERDICT.INCONCLUSIVE)(profileName);
  const [flagState, setFlagState] = useState<FlagState>('idle');

  async function handleFlag() {
    if (!scanLogId || flagState === 'sending') return;
    setFlagState('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/scan-logs/${scanLogId}/flag`, {
        method: 'POST',
      });
      if (res.ok) {
        setFlagState('confirmed');
      } else {
        setFlagState('error');
      }
    } catch {
      setFlagState('error');
    }
  }

  return (
    <View style={[styles.card, { borderLeftColor: outcomeColour }]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: outcomeColour }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{profileName}</Text>
          <OutcomeBadge outcome={evaluation.Outcome} />
          <Text style={styles.outputState}>{verdictText}</Text>
          <Text style={styles.disclaimer}>Based on available product data and your household profiles. Always check the label.</Text>
        </View>
      </View>

      <WhyPanel evaluation={evaluation} />

      {scanLogId != null && (
        <View style={styles.flagRow}>
          {flagState === 'confirmed' ? (
            <Text style={styles.flagConfirmed}>Thanks — we'll review this result.</Text>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.flagBtn, flagState === 'sending' && styles.flagBtnDisabled]}
                onPress={handleFlag}
                disabled={flagState === 'sending'}
                activeOpacity={0.7}
              >
                <Text style={styles.flagBtnText}>Report incorrect result</Text>
              </TouchableOpacity>
              {flagState === 'error' && (
                <Text style={styles.flagError}>Couldn't send report — try again.</Text>
              )}
            </>
          )}
        </View>
      )}

      {evaluation.Confidence_Score < 50 && (
        <View style={styles.lowConfidence}>
          <Text style={styles.lowConfidenceText}>
            Limited product data — confirm before use
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLOURS.CARD_BACKGROUND,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOURS.BORDER,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',               // shadow color — no semantic token
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...TYPOGRAPHY.heading,
    color: COLOURS.WHITE,
    fontWeight: '700',
    fontSize: 18,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...TYPOGRAPHY.subheading,
    fontSize: 16,
    fontWeight: '600',
    color: COLOURS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  outputState: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLOURS.TEXT_MID,
    marginTop: 4,
  },
  lowConfidence: {
    marginTop: 10,
    backgroundColor: COLOURS.LOW_CONF_BG,
    borderRadius: 6,
    padding: 8,
  },
  lowConfidenceText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
  },
  disclaimer: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLOURS.TEXT_FAINT,
    marginTop: 4,
  },
  flagRow: {
    marginTop: 10,
  },
  flagBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOURS.BORDER_SUBTLE,
  },
  flagBtnDisabled: {
    opacity: 0.5,
  },
  flagBtnText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
  },
  flagConfirmed: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.TEXT_SECONDARY,
  },
  flagError: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLOURS.BLOCK,
    marginTop: 4,
  },
});
