// Menu (feuille en bas d'écran) avec les actions principales du navigateur.
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Row({ theme, icon, label, onPress, danger }) {
  const color = danger ? theme.danger : theme.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.inputBg }]}
    >
      <Ionicons name={icon} size={22} color={color} style={{ width: 30 }} />
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function Menu({ theme, visible, onClose, isBookmarked, actions }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <ScrollView bounces={false}>
            <Row theme={theme} icon="add-circle-outline" label="Nouvel onglet" onPress={actions.newTab} />
            <Row
              theme={theme}
              icon={isBookmarked ? 'star' : 'star-outline'}
              label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              onPress={actions.toggleBookmark}
            />
            <Row theme={theme} icon="star-outline" label="Mes favoris" onPress={actions.openBookmarks} />
            <Row theme={theme} icon="time-outline" label="Historique" onPress={actions.openHistory} />
            <Row theme={theme} icon="share-outline" label="Partager la page" onPress={actions.share} />
            <Row theme={theme} icon="reload" label="Recharger" onPress={actions.reload} />
            <Row
              theme={theme}
              icon={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              label={theme.mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
              onPress={actions.toggleTheme}
            />
            <View style={[styles.sep, { backgroundColor: theme.border }]} />
            <Row theme={theme} icon="close-circle-outline" label="Fermer le menu" onPress={onClose} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 30,
    paddingTop: 8,
    maxHeight: '75%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 5,
    borderRadius: 3,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  rowLabel: { fontSize: 17, marginLeft: 8 },
  sep: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
});
