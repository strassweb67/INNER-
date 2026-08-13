// Composant "verre dépoli" réutilisable (glassmorphism) basé sur expo-blur.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

export default function Glass({
  theme,
  intensity = 45,
  overlay,
  border = true,
  hairline = false,
  style,
  children,
}) {
  return (
    <BlurView
      intensity={intensity}
      tint={theme.glassTint}
      style={[
        border && { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.glassBorder },
        style,
        { overflow: 'hidden' },
      ]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: overlay || theme.glassOverlay }]}
      />
      {hairline ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: theme.glassHairline }}
        />
      ) : null}
      {children}
    </BlurView>
  );
}
