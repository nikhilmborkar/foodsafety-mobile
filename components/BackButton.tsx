import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLOURS } from '../constants/colours';

interface Props {
  onPress: () => void;
  variant: 'light' | 'dark';
}

export function BackButton({ onPress, variant }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, variant === 'dark' ? styles.btnDark : styles.btnLight]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chevron, variant === 'dark' ? styles.chevronDark : styles.chevronLight]}>
        ‹
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  btnLight: {
    borderColor: COLOURS.BORDER,
    backgroundColor: 'transparent',
  },
  btnDark: {
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  chevron: {
    fontSize: 18,
  },
  chevronLight: {
    color: COLOURS.TEXT_PRIMARY,
  },
  chevronDark: {
    color: '#F3E9DA',
  },
});
