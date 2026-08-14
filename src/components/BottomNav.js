// Barre de navigation du bas : Accueil, Onglets, +, Collections, Profil.
// Bouton central proéminent (rendu HORS du verre pour ne pas être coupé).
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LaserBar from './LaserBar';

function Item({ theme, icon, label, active, onPress, badge }) {
  const color = active ? theme.accent : theme.subtext;
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.item, pressed && { opacity: 0.5 }]}>
      <View>
        <Ionicons name={icon} size={22} color={color} />
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
    <View>
      <LaserBar theme={theme} radius={26}>
        <View style={styles.bar}>
          <Item theme={theme} icon="home" label="Accueil" active={active === 'home'} onPress={onHome} />
          <Item theme={theme} icon="copy-outline" label="Onglets" active={active === 'tabs'} onPress={onTabs} badge={tabCount} />
          <View style={{ width: 60 }} />
          <Item theme={theme} icon="albums-outline" label="Collections" active={active === 'collections'} onPress={onCollections} />
          <Item theme={theme} icon="person-outline" label="Profil" active={active === 'profil'} onPress={onProfil} />
        </View>
      </LaserBar>

      {/* Bouton central au-dessus de la barre, non coupé */}
      <View style={styles.centerAbs} pointerEvents="box-none">
        <Pressable onPress={onAdd} style={({ pressed }) => [styles.center, { backgroundColor: theme.accent, shadowColor: theme.accent }, pressed && { transform: [{ scale: 0.92 }] }]}>
          <Ionicons name="add" size={30} color={theme.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 9, paddingBottom: 9, minHeight: 60 },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10, fontWeight: '600' },
  badge: { position: 'absolute', top: -6, right: -10, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' },
  centerAbs: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  center: { width: 56, height: 56, borderRadius: 28, marginTop: -24, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 10, borderWidth: 3, borderColor: 'rgba(0,0,0,0.25)' },
});
