import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOURS } from '../constants/colours';

type Edge = 'top' | 'bottom';

interface Props {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}

export function SafeScreen({ children, edges = ['top', 'bottom'], style }: Props) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, style]}>
      <View style={styles.inner}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
  inner: {
    flex: 1,
    paddingTop: 12,
  },
});
