import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLOURS } from '../constants/colours';
import { EvaluationOutput } from '../types';
import { OutcomeBadge } from './OutcomeBadge';
import { WhyPanel } from './WhyPanel';

interface Props {
  profileName: string;
  evaluation: EvaluationOutput;
}

const BG: Record<string, string> = {
  BLOCK: COLOURS.BLOCK,
  WARN: COLOURS.WARN,
  ALLOW: COLOURS.ALLOW,
};

const VERDICT: Record<string, (name: string) => string> = {
  ALLOW: (name) => `Checked for ${name} — no issues found`,
  WARN:  (name) => `Checked for ${name} — review before giving`,
  BLOCK: (name) => `Checked for ${name} — not suitable, avoid`,
};

export function MemberCard({ profileName, evaluation }: Props) {
  const initial = profileName.charAt(0).toUpperCase();
  const verdictText = (VERDICT[evaluation.Outcome] ?? VERDICT.ALLOW)(profileName);

  return (
    <View style={[styles.card, { borderLeftColor: BG[evaluation.Outcome] }]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: BG[evaluation.Outcome] }]}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
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
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  outputState: {
    fontSize: 16,
    color: '#4A5568',
    marginTop: 4,
  },
  lowConfidence: {
    marginTop: 10,
    backgroundColor: '#EDF2F7',
    borderRadius: 6,
    padding: 8,
  },
  lowConfidenceText: {
    fontSize: 12,
    color: '#718096',
  },
  disclaimer: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 4,
  },
});
