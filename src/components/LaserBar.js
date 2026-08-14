// Barre flottante en verre avec un rebord accent (couleur du thème) statique + léger halo.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Glass from './Glass';

export default function LaserBar({ theme, radius = 28, intensity = 80, children, style }) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: 1.5,
          borderColor: theme.accent,
          shadowColor: theme.accent,
          shadowOpacity: 0.45,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Glass theme={theme} border={false} hairline intensity={intensity}>
        {children}
      </Glass>
    </View>
  );
}
