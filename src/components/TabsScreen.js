// Écran de gestion des onglets : liste compacte, fine et sombre pour bien voir les onglets.
import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { domainOf } from '../utils/url';

const TOP = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 47;

export default function TabsScreen({
  theme,
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onNewTab,
  onDone,
  onCloseAll,
  bottomInset = 0,
}) {
  const renderItem = ({ item }) => {
    const active = item.id === activeTabId;
    const title = item.title && item.title !== 'Nouvel onglet'
      ? item.title
      : (item.currentUrl ? domainOf(item.currentUrl) : 'Nouvel onglet');
    return (
      <Pressable
        onPress={() => onSelect(item.id)}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: active ? 'rgba(10,132,255,0.16)' : 'rgba(255,255,255,0.05)',
            borderColor: active ? theme.accent : 'rgba(255,255,255,0.09)',
          },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.favicon}>
          <Ionicons name={item.incognito ? 'eye-off' : 'globe-outline'} size={17} color="#c9cdd6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.rowTitle}>{title}</Text>
          <Text numberOfLines={1} style={styles.rowUrl}>{item.currentUrl || 'Page d’accueil'}</Text>
        </View>
        <Pressable onPress={() => onClose(item.id)} hitSlop={12} style={styles.close}>
          <Ionicons name="close" size={18} color="#9aa0ab" />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#07080d' }}>
      <LinearGradient colors={['#0a0e1c', '#0d0a18']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <View style={[styles.container, { paddingTop: TOP }]}>
        <View style={styles.header}>
          <Pressable onPress={onCloseAll} hitSlop={8}>
            <Text style={[styles.headerBtn, { color: theme.accent }]}>Tout fermer</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{tabs.length} onglet{tabs.length > 1 ? 's' : ''}</Text>
          <Pressable onPress={onDone} hitSlop={8}>
            <Text style={[styles.headerBtn, { color: theme.accent, fontWeight: '700' }]}>OK</Text>
          </Pressable>
        </View>

        <FlatList
          data={tabs}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 90 + bottomInset }}
        />

        <Pressable
          onPress={onNewTab}
          style={({ pressed }) => [styles.newTab, { bottom: 18 + bottomInset }, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.newTabText}>Nouvel onglet</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  headerBtn: { fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  favicon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  rowTitle: { color: '#f2f3f6', fontSize: 14.5, fontWeight: '600' },
  rowUrl: { color: '#8a8f9b', fontSize: 12, marginTop: 1 },
  close: { paddingLeft: 10 },
  newTab: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#0a84ff',
  },
  newTabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
