// Écran de gestion des onglets : aperçu en grille, changement, fermeture, ajout.
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { domainOf } from '../utils/url';

export default function TabsScreen({
  theme,
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onNewTab,
  onDone,
  onCloseAll,
}) {
  const renderItem = ({ item }) => {
    const active = item.id === activeTabId;
    return (
      <Pressable
        onPress={() => onSelect(item.id)}
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: active ? theme.accent : theme.border },
        ]}
      >
        <View style={[styles.cardHeader, { borderBottomColor: theme.border }]}>
          <Ionicons name="globe-outline" size={14} color={theme.subtext} />
          <Text numberOfLines={1} style={[styles.cardTitle, { color: theme.text }]}>
            {item.title || domainOf(item.currentUrl || item.url) || 'Nouvel onglet'}
          </Text>
          <Pressable onPress={() => onClose(item.id)} hitSlop={10}>
            <Ionicons name="close" size={18} color={theme.subtext} />
          </Pressable>
        </View>
        <View style={styles.cardBody}>
          <Text numberOfLines={4} style={[styles.cardUrl, { color: theme.subtext }]}>
            {item.currentUrl || item.url}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.chromeBg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onCloseAll} hitSlop={8}>
          <Text style={[styles.headerBtn, { color: theme.accent }]}>Tout fermer</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {tabs.length} onglet{tabs.length > 1 ? 's' : ''}
        </Text>
        <Pressable onPress={onDone} hitSlop={8}>
          <Text style={[styles.headerBtn, { color: theme.accent, fontWeight: '700' }]}>OK</Text>
        </Pressable>
      </View>

      <FlatList
        data={tabs}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.grid}
      />

      <Pressable
        onPress={onNewTab}
        style={[styles.newTab, { backgroundColor: theme.accent }]}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.newTabText}>Nouvel onglet</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerBtn: { fontSize: 16 },
  grid: { padding: 12, gap: 12 },
  card: {
    flex: 1,
    height: 160,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: { flex: 1, fontSize: 12, fontWeight: '600' },
  cardBody: { flex: 1, padding: 10 },
  cardUrl: { fontSize: 12, lineHeight: 16 },
  newTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  newTabText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
