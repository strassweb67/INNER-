// Page d'OPTIONS plein écran (remplace le menu du bas) : options rondes + choix de couleurs.
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Glass from './Glass';

const TOP = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 47;

function RoundOption({ theme, icon, label, onPress, tint }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.optWrap, pressed && { opacity: 0.55, transform: [{ scale: 0.95 }] }]}>
      <Glass theme={theme} style={styles.optCircle} intensity={60} hairline>
        <Ionicons name={icon} size={26} color={tint || theme.text} />
      </Glass>
      <Text numberOfLines={2} style={[styles.optLabel, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen({ theme, isBookmarked, actions, themeOptions, currentThemeKey, onPickTheme, onClose, bottomInset = 0 }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={{ paddingTop: TOP, flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Options</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 + bottomInset }}>
          <View style={styles.grid}>
            <RoundOption theme={theme} icon="add" label="Nouvel onglet" onPress={actions.newTab} />
            <RoundOption theme={theme} icon="eye-off-outline" label="Onglet privé" onPress={actions.incognito} />
            <RoundOption theme={theme} icon={isBookmarked ? 'star' : 'star-outline'} tint={isBookmarked ? '#f5c518' : theme.text} label={isBookmarked ? 'Retirer favori' : 'Ajouter favori'} onPress={actions.toggleBookmark} />
            <RoundOption theme={theme} icon="star-outline" label="Favoris" onPress={actions.openBookmarks} />
            <RoundOption theme={theme} icon="time-outline" label="Historique" onPress={actions.openHistory} />
            <RoundOption theme={theme} icon="share-social-outline" label="Partager" onPress={actions.share} />
            <RoundOption theme={theme} icon="reload-outline" label="Recharger" onPress={actions.reload} />
            <RoundOption theme={theme} icon="home-outline" label="Accueil" onPress={actions.home} />
          </View>

          <Text style={[styles.section, { color: theme.subtext }]}>COULEUR DU THÈME</Text>
          <View style={styles.colors}>
            {themeOptions.map((opt) => {
              const active = opt.key === currentThemeKey;
              return (
                <Pressable key={opt.key} onPress={() => onPickTheme(opt.key)} style={styles.colorWrap}>
                  <View style={[styles.swatch, { backgroundColor: opt.accent, borderColor: active ? '#fff' : 'rgba(255,255,255,0.25)', borderWidth: active ? 3 : 1.5 }]}>
                    {active ? <Ionicons name="checkmark" size={22} color={opt.onAccent || '#fff'} /> : null}
                  </View>
                  <Text numberOfLines={1} style={[styles.colorLabel, { color: active ? theme.text : theme.subtext }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 26, fontWeight: '800' },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 8 },
  optWrap: { width: '25%', alignItems: 'center', marginBottom: 22, paddingHorizontal: 4 },
  optCircle: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  optLabel: { fontSize: 12, textAlign: 'center', marginTop: 9, lineHeight: 15 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 12, marginBottom: 16, paddingHorizontal: 20 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  colorWrap: { width: '25%', alignItems: 'center', marginBottom: 22, paddingHorizontal: 4 },
  swatch: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  colorLabel: { fontSize: 11.5, textAlign: 'center', marginTop: 8 },
});
