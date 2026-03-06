import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLOURS } from '../constants/colours';
import { EvaluationOutput } from '../types';
import { OutcomeBadge } from './OutcomeBadge';

interface Props {
  profileName: string;
  evaluation: EvaluationOutput;
}

const BG: Record<string, string> = {
  BLOCK: COLOURS.BLOCK,
  WARN: COLOURS.WARN,
  ALLOW: COLOURS.ALLOW,
};

export function MemberCard({ profileName, evaluation }: Props) {
  const [expanded, setExpanded] = useState(false);
  const initial = profileName.charAt(0).toUpperCase();
  const showExpand =
    evaluation.Outcome === 'BLOCK' || evaluation.Outcome === 'WARN';

  return (
    <View style={[styles.card, { borderLeftColor: BG[evaluation.Outcome] }]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: BG[evaluation.Outcome] }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{profileName}</Text>
          <OutcomeBadge outcome={evaluation.Outcome} />
          <Text style={styles.outputState}>{evaluation.Output_State}</Text>
        </View>
        {showExpand && (
          <TouchableOpacity
            onPress={() => setExpanded(e => !e)}
            style={styles.expandBtn}
          >
            <Text style={styles.expandText}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && showExpand && (
        <View style={styles.expandedSection}>
          {evaluation.Matched_Signals && evaluation.Matched_Signals.length > 0 && (
            <View>
              <Text style={styles.expandLabel}>Matched signals</Text>
              {evaluation.Matched_Signals.map((s, i) => (
                <Text key={i} style={styles.expandItem}>• {s}</Text>
              ))}
            </View>
          )}
          {evaluation.Message_Codes && evaluation.Message_Codes.length > 0 && (
            <View style={styles.messageCodesBlock}>
              <Text style={styles.expandLabel}>Message codes</Text>
              {evaluation.Message_Codes.map((c, i) => (
                <Text key={i} style={styles.expandItem}>• {c}</Text>
              ))}
            </View>
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
    fontSize: 13,
    color: '#4A5568',
    marginTop: 4,
  },
  expandBtn: {
    padding: 4,
    marginLeft: 8,
  },
  expandText: {
    fontSize: 12,
    color: '#718096',
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  expandLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  expandItem: {
    fontSize: 13,
    color: '#4A5568',
    marginBottom: 2,
  },
  messageCodesBlock: {
    marginTop: 8,
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
});
