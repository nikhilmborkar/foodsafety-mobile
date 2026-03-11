import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLOURS } from '../constants/colours';

interface Props {
  outcome: 'BLOCK' | 'WARN' | 'ALLOW';
}

const BG: Record<string, string> = {
  BLOCK: COLOURS.BLOCK,
  WARN: COLOURS.WARN,
  ALLOW: COLOURS.ALLOW,
};

export function OutcomeBadge({ outcome }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: BG[outcome] }]}>
      <Text style={styles.text}>{outcome}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    color: COLOURS.WHITE,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
