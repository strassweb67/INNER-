// Barre d'outils du bas (verre) : précédent, suivant, accueil, onglets, menu.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Glass from './Glass';

function ToolButton({ name, onPress, disabled, color, badge }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && !disabled && { opacity: 0.4 }]}
    >
      <Ionicons name={name} size={25} color={disabled ? color.subtext : color.text} />
      {badge != null && (
        <View style={[styles.badge, { borderColor: color.text }]}>
          <Text style={[styles.badgeText, { color: color.text }]}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function Toolbar({
  theme,
  canGoBack,
  canGoForward,
  tabCount,
  onBack,
  onForward,
  onHome,
  onTabs,
  onMenu,
  bottomInset = 0,
}) {
  return (
    <Glass theme={theme} border={false} hairline intensity={60} style={{ paddingBottom: bottomInset }}>
      <View style={styles.bar}>
        <ToolButton name="chevron-back" onPress={onBack} disabled={!canGoBack} color={theme} />
        <ToolButton name="chevron-forward" onPress={onForward} disabled={!canGoForward} color={theme} />
        <ToolButton name="home-outline" onPress={onHome} color={theme} />
        <ToolButton name="copy-outline" onPress={onTabs} color={theme} badge={tabCount} />
        <ToolButton name="menu" onPress={onMenu} color={theme} />
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 7,
  },
  btn: { padding: 6, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 2,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
