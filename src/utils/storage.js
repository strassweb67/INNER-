// Sauvegarde locale (favoris, historique, préférences) via AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  bookmarks: '@browser/bookmarks',
  history: '@browser/history',
  settings: '@browser/settings',
  shortcuts: '@browser/shortcuts',
  memos: '@browser/memos',
};

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // silencieux : le stockage ne doit jamais faire planter l'app
  }
}

// ---- Favoris ----
export function loadBookmarks() {
  return readJson(KEYS.bookmarks, []);
}
export function saveBookmarks(list) {
  return writeJson(KEYS.bookmarks, list);
}

// ---- Historique ----
export function loadHistory() {
  return readJson(KEYS.history, []);
}
export function saveHistory(list) {
  return writeJson(KEYS.history, list);
}

// ---- Préférences ----
export function loadSettings() {
  return readJson(KEYS.settings, { theme: 'auto' });
}
export function saveSettings(settings) {
  return writeJson(KEYS.settings, settings);
}

// ---- Raccourcis / dossiers de la page d'accueil ----
export function loadShortcuts(fallback) {
  return readJson(KEYS.shortcuts, fallback);
}
export function saveShortcuts(items) {
  return writeJson(KEYS.shortcuts, items);
}

// ---- Mémos (Mémoire Pro) ----
export function loadMemos(fallback) {
  return readJson(KEYS.memos, fallback);
}
export function saveMemos(list) {
  return writeJson(KEYS.memos, list);
}
