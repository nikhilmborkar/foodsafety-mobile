import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLOURS } from '../constants/colours';

type Edge = 'top' | 'bottom';

interface Props {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
}

export function SafeScreen({ children, edges = ['top', 'bottom'], style }: Props) {
  const insets = useSafeAreaInsets();
  const safePadding: ViewStyle = {};
  if (edges.includes('top')) safePadding.paddingTop = insets.top + 12;
  if (edges.includes('bottom')) safePadding.paddingBottom = Math.max(insets.bottom, 16);

  return (
    <View style={[styles.screen, safePadding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOURS.BACKGROUND,
  },
});
