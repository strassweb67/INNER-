// Page d'accueil (nouvel onglet) : fond dégradé + recherche en verre + tuiles en verre.
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Glass from './Glass';

const SHORTCUTS = [
  { name: 'Google', url: 'https://www.google.com', bg: '#4285F4', label: 'G' },
  { name: 'YouTube', url: 'https://m.youtube.com', bg: '#FF0000', label: '▶' },
  { name: 'Facebook', url: 'https://www.facebook.com', bg: '#1877F2', label: 'f' },
  { name: 'Instagram', url: 'https://www.instagram.com', bg: '#E4405F', label: '◎' },
  { name: 'Wikipedia', url: 'https://fr.wikipedia.org', bg: '#111111', label: 'W' },
  { name: 'GitHub', url: 'https://github.com', bg: '#24292e', label: '' },
  { name: 'Amazon', url: 'https://www.amazon.fr', bg: '#FF9900', label: 'a' },
  { name: 'Yandex', url: 'https://yandex.com', bg: '#FF3333', label: 'Y' },
];

export default function HomeScreen({ theme, incognito, onOpen, onSearch }) {
  const [q, setQ] = React.useState('');
  const submit = () => {
    const v = q.trim();
    if (v) onSearch(v);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {incognito ? (
          <Glass theme={theme} style={styles.incognitoBanner} intensity={40}>
            <Ionicons name="eye-off" size={16} color={theme.text} />
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>Navigation privée</Text>
          </Glass>
        ) : null}

        <Text style={[styles.brand, { color: theme.text }]}>Mon Navigateur</Text>

        <Glass theme={theme} style={styles.searchBar} intensity={60} hairline>
          <Ionicons name="search" size={18} color={theme.subtext} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={q}
            onChangeText={setQ}
            onSubmitEditing={submit}
            placeholder="Rechercher ou saisir une adresse"
            placeholderTextColor={theme.subtext}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={theme.subtext} />
            </Pressable>
          ) : null}
        </Glass>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sites favoris</Text>
        <View style={styles.grid}>
          {SHORTCUTS.map((s) => (
            <Pressable
              key={s.url}
              onPress={() => onOpen(s.url)}
              style={({ pressed }) => [styles.tileWrap, pressed && { opacity: 0.6, transform: [{ scale: 0.96 }] }]}
            >
              <Glass theme={theme} style={styles.tile} intensity={50} hairline>
                <View style={[styles.tileIcon, { backgroundColor: s.bg }]}>
                  <Text style={styles.tileLabel}>{s.label || s.name.charAt(0)}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.tileName, { color: theme.text }]}>{s.name}</Text>
              </Glass>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingTop: 34, paddingBottom: 40 },
  incognitoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    marginBottom: 20,
  },
  brand: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 26, letterSpacing: 0.3 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 32,
  },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16, marginLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tileWrap: { width: '23.5%', marginBottom: 14 },
  tile: {
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  tileLabel: { color: '#fff', fontSize: 22, fontWeight: '800' },
  tileName: { fontSize: 11, textAlign: 'center' },
});
