// Barre d'outils du bas : précédent, suivant, accueil, onglets, menu.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
}) {
  return (
    <View style={[styles.bar, { backgroundColor: theme.toolbarBg, borderTopColor: theme.border }]}>
      <ToolButton name="chevron-back" onPress={onBack} disabled={!canGoBack} color={theme} />
      <ToolButton name="chevron-forward" onPress={onForward} disabled={!canGoForward} color={theme} />
      <ToolButton name="home-outline" onPress={onHome} color={theme} />
      <ToolButton name="copy-outline" onPress={onTabs} color={theme} badge={tabCount} />
      <ToolButton name="menu" onPress={onMenu} color={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    padding: 6,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
