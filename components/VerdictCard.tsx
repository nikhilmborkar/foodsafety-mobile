import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MemberResult } from '../types/verdict';
import { VERDICT_COLORS } from '../lib/verdictUtils';

interface Props {
  member: MemberResult;
  onPress?: () => void;
}

const VERDICT_LABEL: Record<string, string> = {
  ALLOW: 'Safe',
  WARN: 'Caution',
  BLOCK: 'Avoid',
  INCONCLUSIVE: 'Unknown',
};

const VERDICT_BADGE_BG: Record<string, string> = {
  ALLOW: '#D1FAE5',
  WARN: '#FEF3C7',
  BLOCK: '#FFE4E6',
  INCONCLUSIVE: '#F1F5F9',
};

const VERDICT_BADGE_TEXT: Record<string, string> = {
  ALLOW: '#065F46',
  WARN: '#92400E',
  BLOCK: '#9F1239',
  INCONCLUSIVE: '#475569',
};

export function VerdictCard({ member, onPress }: Props) {
  const borderColor = VERDICT_COLORS[member.verdict];
  const badgeBg = VERDICT_BADGE_BG[member.verdict];
  const badgeText = VERDICT_BADGE_TEXT[member.verdict];
  const label = VERDICT_LABEL[member.verdict];

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: borderColor }]}>
          <Text style={styles.avatarText}>{member.memberInitial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{member.memberName}</Text>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeText }]}>{label}</Text>
          </View>
          {member.explanation ? (
            <Text style={styles.explanation} numberOfLines={2}>{member.explanation}</Text>
          ) : null}
        </View>
      </View>

      {member.verdict === 'WARN' && (
        <View style={styles.seeWhyRow}>
          <Text style={styles.seeWhyText}>See why →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
    color: '#0F172A',
    marginBottom: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  explanation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 2,
  },
  seeWhyRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  seeWhyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#D97706',
  },
});
