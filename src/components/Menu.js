// Menu (feuille en bas d'écran) avec les actions du navigateur, en grille façon Yandex.
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function GridItem({ theme, icon, label, onPress, tint }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.5 }]}
    >
      <View style={[styles.itemIcon, { backgroundColor: theme.inputBg }]}>
        <Ionicons name={icon} size={24} color={tint || theme.text} />
      </View>
      <Text numberOfLines={2} style={[styles.itemLabel, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function Menu({ theme, visible, onClose, isBookmarked, actions }) {
  const run = (fn) => () => { if (fn) fn(); };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.grid}>
              <GridItem theme={theme} icon="add-outline" label="Nouvel onglet" onPress={run(actions.newTab)} />
              <GridItem theme={theme} icon="eye-off-outline" label="Onglet privé" onPress={run(actions.incognito)} />
              <GridItem
                theme={theme}
                icon={isBookmarked ? 'star' : 'star-outline'}
                label={isBookmarked ? 'Retirer favori' : 'Ajouter favori'}
                tint={isBookmarked ? '#f5c518' : theme.text}
                onPress={run(actions.toggleBookmark)}
              />
              <GridItem theme={theme} icon="star-outline" label="Favoris" onPress={run(actions.openBookmarks)} />

              <GridItem theme={theme} icon="time-outline" label="Historique" onPress={run(actions.openHistory)} />
              <GridItem theme={theme} icon="share-social-outline" label="Partager" onPress={run(actions.share)} />
              <GridItem theme={theme} icon="reload-outline" label="Recharger" onPress={run(actions.reload)} />
              <GridItem
                theme={theme}
                icon={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                label={theme.mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
                onPress={run(actions.toggleTheme)}
              />
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, { borderTopColor: theme.border }, pressed && { opacity: 0.5 }]}
            >
              <Text style={{ color: theme.subtext, fontSize: 16 }}>Fermer</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '70%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginVertical: 10 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  item: { width: '25%', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemLabel: { fontSize: 12, textAlign: 'center', lineHeight: 15 },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
