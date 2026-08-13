// Écran de gestion des onglets : dégradé + cartes en verre.
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
import Glass from './Glass';
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
}) {
  const renderItem = ({ item }) => {
    const active = item.id === activeTabId;
    const title = item.title && item.title !== 'Nouvel onglet'
      ? item.title
      : (item.currentUrl ? domainOf(item.currentUrl) : 'Nouvel onglet');
    return (
      <Pressable onPress={() => onSelect(item.id)} style={styles.cardWrap}>
        <Glass
          theme={theme}
          intensity={50}
          hairline
          style={[styles.card, { borderColor: active ? theme.accent : theme.glassBorder, borderWidth: active ? 2 : StyleSheet.hairlineWidth }]}
        >
          <View style={[styles.cardHeader, { borderBottomColor: theme.glassBorder }]}>
            <Ionicons name={item.incognito ? 'eye-off' : 'globe-outline'} size={14} color={theme.subtext} />
            <Text numberOfLines={1} style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
            <Pressable onPress={() => onClose(item.id)} hitSlop={10}>
              <Ionicons name="close" size={18} color={theme.subtext} />
            </Pressable>
          </View>
          <View style={styles.cardBody}>
            <Text numberOfLines={4} style={[styles.cardUrl, { color: theme.subtext }]}>
              {item.currentUrl || 'Page d’accueil'}
            </Text>
          </View>
        </Glass>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={theme.gradientTabs} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={[styles.container, { paddingTop: TOP }]}>
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

        <Pressable onPress={onNewTab} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
          <Glass theme={theme} border hairline intensity={60} style={[styles.newTab, { borderColor: theme.glassBorder }]}>
            <Ionicons name="add" size={22} color={theme.accent} />
            <Text style={[styles.newTabText, { color: theme.text }]}>Nouvel onglet</Text>
          </Glass>
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
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerBtn: { fontSize: 16 },
  grid: { padding: 12, gap: 12 },
  cardWrap: { flex: 1, marginBottom: 12 },
  card: { height: 160, borderRadius: 16, overflow: 'hidden' },
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
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 16,
  },
  newTabText: { fontSize: 17, fontWeight: '600' },
});
