// Page d'accueil (nouvel onglet) : barre de recherche + tuiles de sites favoris.
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SHORTCUTS = [
  { name: 'Google', url: 'https://www.google.com', bg: '#4285F4', label: 'G' },
  { name: 'YouTube', url: 'https://m.youtube.com', bg: '#FF0000', label: '▶' },
  { name: 'Facebook', url: 'https://www.facebook.com', bg: '#1877F2', label: 'f' },
  { name: 'Instagram', url: 'https://www.instagram.com', bg: '#E4405F', label: '◎' },
  { name: 'Wikipedia', url: 'https://fr.wikipedia.org', bg: '#000000', label: 'W' },
  { name: 'GitHub', url: 'https://github.com', bg: '#24292e', label: '' },
  { name: 'Amazon', url: 'https://www.amazon.fr', bg: '#FF9900', label: 'a' },
  { name: 'Yandex', url: 'https://yandex.com', bg: '#FF3333', label: 'Y' },
  { name: 'Twitch', url: 'https://m.twitch.tv', bg: '#9146FF', label: 'T' },
];

export default function HomeScreen({ theme, incognito, onOpen, onSearch }) {
  const [q, setQ] = React.useState('');

  const submit = () => {
    const v = q.trim();
    if (v) onSearch(v);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {incognito ? (
        <View style={[styles.incognitoBanner, { backgroundColor: theme.inputBg }]}>
          <Ionicons name="eye-off" size={18} color={theme.text} />
          <Text style={{ color: theme.text, fontSize: 13 }}>Navigation privée activée</Text>
        </View>
      ) : null}

      <Text style={[styles.brand, { color: theme.text }]}>Mon Navigateur</Text>

      {/* Barre de recherche */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBg }]}>
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
      </View>

      {/* Tuiles */}
      <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Sites favoris</Text>
      <View style={styles.grid}>
        {SHORTCUTS.map((s) => (
          <Pressable
            key={s.url}
            onPress={() => onOpen(s.url)}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.6 }]}
          >
            <View style={[styles.tileIcon, { backgroundColor: s.bg }]}>
              <Text style={styles.tileLabel}>{s.label || s.name.charAt(0)}</Text>
            </View>
            <Text numberOfLines={1} style={[styles.tileName, { color: theme.text }]}>
              {s.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const TILE_GAP = 14;

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 30, paddingBottom: 40 },
  incognitoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  brand: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 26,
    paddingHorizontal: 18,
    height: 52,
    marginBottom: 30,
  },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '22%',
    alignItems: 'center',
    marginBottom: TILE_GAP + 6,
  },
  tileIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileLabel: { color: '#fff', fontSize: 26, fontWeight: '800' },
  tileName: { fontSize: 12, textAlign: 'center' },
});
