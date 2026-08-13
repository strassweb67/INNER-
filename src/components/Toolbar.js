// Barre d'outils du bas (contenu) : précédent, suivant, accueil, onglets, menu.
// Rendue à l'intérieur de LaserBar (qui fournit le verre + le liseré lumineux).
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function ToolButton({ name, onPress, disabled, color }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && !disabled && { opacity: 0.4 }]}
    >
      <Ionicons name={name} size={24} color={disabled ? color.subtext : color.text} />
    </Pressable>
  );
}

// Icône multi-onglets : carré arrondi contenant le nombre d'onglets.
function TabsButton({ theme, count, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.4 }]}
    >
      <View style={[styles.tabsBox, { borderColor: theme.text }]}>
        <Text style={[styles.tabsCount, { color: theme.text }]} numberOfLines={1}>
          {count > 99 ? '99+' : String(count)}
        </Text>
      </View>
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
    <View style={styles.bar}>
      <ToolButton name="chevron-back" onPress={onBack} disabled={!canGoBack} color={theme} />
      <ToolButton name="chevron-forward" onPress={onForward} disabled={!canGoForward} color={theme} />
      <ToolButton name="home-outline" onPress={onHome} color={theme} />
      <TabsButton theme={theme} count={tabCount} onPress={onTabs} />
      <ToolButton name="menu" onPress={onMenu} color={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 6,
  },
  btn: { paddingHorizontal: 10, paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  tabsBox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsCount: { fontSize: 12, fontWeight: '800' },
});
