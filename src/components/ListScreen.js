// Écran liste réutilisable pour les Favoris et l'Historique.
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { prettyUrl } from '../utils/url';

export default function ListScreen({
  theme,
  title,
  icon,
  items,
  emptyText,
  onOpen,
  onDelete,
  onClearAll,
  onBack,
}) {
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => onOpen(item.url)}
      style={({ pressed }) => [
        styles.item,
        { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.inputBg },
      ]}
    >
      <View style={[styles.favicon, { backgroundColor: theme.inputBg }]}>
        <Ionicons name="globe-outline" size={18} color={theme.subtext} />
      </View>
      <View style={styles.itemText}>
        <Text numberOfLines={1} style={[styles.itemTitle, { color: theme.text }]}>
          {item.title || prettyUrl(item.url)}
        </Text>
        <Text numberOfLines={1} style={[styles.itemUrl, { color: theme.subtext }]}>
          {prettyUrl(item.url)}
        </Text>
      </View>
      <Pressable onPress={() => onDelete(item)} hitSlop={10} style={styles.del}>
        <Ionicons name="close" size={18} color={theme.subtext} />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={26} color={theme.accent} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Ionicons name={icon} size={18} color={theme.text} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
        </View>
        <Pressable onPress={onClearAll} hitSlop={8} style={[styles.headerSide, { alignItems: 'flex-end' }]}>
          {items.length > 0 ? (
            <Ionicons name="trash-outline" size={22} color={theme.danger} />
          ) : (
            <View style={{ width: 22 }} />
          )}
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name={icon} size={46} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.subtext }]}>{emptyText}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, i) => (it.id ? String(it.id) : it.url + i)}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSide: { width: 60, justifyContent: 'center' },
  headerTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  favicon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 16 },
  itemUrl: { fontSize: 13, marginTop: 2 },
  del: { paddingLeft: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15 },
});
