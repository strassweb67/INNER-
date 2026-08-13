// Barre de navigation du bas (style mockup) : Accueil, Onglets, +, Collections, Profil.
// Fine, en verre, avec bouton central proéminent. Se place au-dessus de la barre système.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LaserBar from './LaserBar';

function Item({ theme, icon, label, active, onPress, badge }) {
  const color = active ? theme.accent : theme.subtext;
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.item, pressed && { opacity: 0.5 }]}>
      <View>
        <Ionicons name={icon} size={23} color={color} />
        {badge != null ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={{ color: theme.onAccent, fontSize: 9, fontWeight: '800' }}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function BottomNav({ theme, active, tabCount, onHome, onTabs, onAdd, onCollections, onProfil }) {
  return (
    <LaserBar theme={theme} radius={26}>
      <View style={styles.bar}>
        <Item theme={theme} icon="home" label="Accueil" active={active === 'home'} onPress={onHome} />
        <Item theme={theme} icon="copy-outline" label="Onglets" active={active === 'tabs'} onPress={onTabs} badge={tabCount} />

        <Pressable onPress={onAdd} style={({ pressed }) => [styles.centerWrap, pressed && { transform: [{ scale: 0.92 }] }]}>
          <View style={[styles.center, { backgroundColor: theme.accent, shadowColor: theme.accent }]}>
            <Ionicons name="add" size={30} color={theme.onAccent} />
          </View>
        </Pressable>

        <Item theme={theme} icon="albums-outline" label="Collections" active={active === 'collections'} onPress={onCollections} />
        <Item theme={theme} icon="person-outline" label="Profil" active={active === 'profil'} onPress={onProfil} />
      </View>
    </LaserBar>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, minHeight: 58 },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10, fontWeight: '600' },
  badge: { position: 'absolute', top: -6, right: -10, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' },
  centerWrap: { width: 64, alignItems: 'center', justifyContent: 'center' },
  center: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: -18, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
});
