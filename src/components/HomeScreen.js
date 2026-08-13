// Page d'accueil : recherche + raccourcis + DOSSIERS.
// Appui long => menu (ouvrir, renommer, déplacer vers dossier, supprimer).
// Ajout de raccourcis, création/renommage/suppression de dossiers.
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Glass from './Glass';
import * as store from '../utils/storage';

const PALETTE = ['#4285F4', '#FF0000', '#1877F2', '#E4405F', '#111827', '#24292e', '#FF9900', '#FF3333', '#9146FF', '#25D366', '#00A1F1', '#FF6600'];

let _sid = 0;
const sid = () => `s_${Date.now().toString(36)}_${_sid++}`;

const DEFAULT_ITEMS = [
  { id: 's_g', type: 'site', name: 'Google', url: 'https://www.google.com', color: '#4285F4', label: 'G' },
  { id: 's_yt', type: 'site', name: 'YouTube', url: 'https://m.youtube.com', color: '#FF0000', label: '▶' },
  { id: 's_fb', type: 'site', name: 'Facebook', url: 'https://www.facebook.com', color: '#1877F2', label: 'f' },
  { id: 's_ig', type: 'site', name: 'Instagram', url: 'https://www.instagram.com', color: '#E4405F', label: '◎' },
  { id: 's_wk', type: 'site', name: 'Wikipedia', url: 'https://fr.wikipedia.org', color: '#111827', label: 'W' },
  { id: 's_gh', type: 'site', name: 'GitHub', url: 'https://github.com', color: '#24292e', label: '' },
  { id: 's_az', type: 'site', name: 'Amazon', url: 'https://www.amazon.fr', color: '#FF9900', label: 'a' },
  { id: 's_yx', type: 'site', name: 'Yandex', url: 'https://yandex.com', color: '#FF3333', label: 'Y' },
];

function normalizeUrl(u) {
  const t = (u || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://' + t;
}

export default function HomeScreen({ theme, incognito, onOpen, onSearch }) {
  const [q, setQ] = React.useState('');
  const [items, setItems] = React.useState(DEFAULT_ITEMS);
  const [openFolder, setOpenFolder] = React.useState(null); // id du dossier ouvert
  const [modal, setModal] = React.useState(null); // {type, ...}
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const saved = await store.loadShortcuts(null);
      if (Array.isArray(saved) && saved.length) setItems(saved);
      setLoaded(true);
    })();
  }, []);

  React.useEffect(() => {
    if (loaded) store.saveShortcuts(items);
  }, [items, loaded]);

  const folders = items.filter((i) => i.type === 'folder');
  const currentFolder = openFolder ? items.find((i) => i.id === openFolder && i.type === 'folder') : null;

  const submit = () => {
    const v = q.trim();
    if (v) onSearch(v);
  };

  // ---- Opérations ----
  const addSite = (name, url, folderId) => {
    const site = {
      id: sid(),
      type: 'site',
      name: name || url,
      url: normalizeUrl(url),
      color: PALETTE[(name || url).length % PALETTE.length],
      label: (name || url).trim().charAt(0).toUpperCase(),
    };
    setItems((prev) => {
      if (!folderId) return [...prev, site];
      return prev.map((it) => (it.id === folderId ? { ...it, items: [...(it.items || []), site] } : it));
    });
  };

  const addFolder = (name) => {
    setItems((prev) => [...prev, { id: 'f_' + sid(), type: 'folder', name: name || 'Dossier', items: [] }]);
  };

  const renameItem = (id, name, parentFolderId) => {
    setItems((prev) =>
      prev.map((it) => {
        if (parentFolderId && it.id === parentFolderId) {
          return { ...it, items: (it.items || []).map((c) => (c.id === id ? { ...c, name } : c)) };
        }
        if (!parentFolderId && it.id === id) return { ...it, name };
        return it;
      })
    );
  };

  const deleteItem = (id, parentFolderId) => {
    setItems((prev) => {
      if (parentFolderId) {
        return prev.map((it) => (it.id === parentFolderId ? { ...it, items: (it.items || []).filter((c) => c.id !== id) } : it));
      }
      const target = prev.find((it) => it.id === id);
      // supprimer un dossier : on remonte ses raccourcis à la racine
      if (target && target.type === 'folder' && (target.items || []).length) {
        return [...prev.filter((it) => it.id !== id), ...target.items];
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  const moveSite = (siteId, fromFolderId, toFolderId) => {
    setItems((prev) => {
      let site = null;
      let next = prev.map((it) => {
        if (fromFolderId && it.id === fromFolderId) {
          const found = (it.items || []).find((c) => c.id === siteId);
          if (found) site = found;
          return { ...it, items: (it.items || []).filter((c) => c.id !== siteId) };
        }
        return it;
      });
      if (!fromFolderId) {
        site = prev.find((it) => it.id === siteId) || null;
        next = next.filter((it) => it.id !== siteId);
      }
      if (!site) return prev;
      if (!toFolderId) return [...next, site];
      return next.map((it) => (it.id === toFolderId ? { ...it, items: [...(it.items || []), site] } : it));
    });
  };

  // ---- Rendu d'une tuile ----
  const renderTile = (item, parentFolderId) => {
    if (item.type === 'folder') {
      const preview = (item.items || []).slice(0, 4);
      return (
        <Pressable
          key={item.id}
          onPress={() => setOpenFolder(item.id)}
          onLongPress={() => setModal({ type: 'context', item, parentFolderId: null })}
          delayLongPress={350}
          style={({ pressed }) => [styles.tileWrap, pressed && { opacity: 0.6 }]}
        >
          <Glass theme={theme} style={styles.tile} intensity={50} hairline>
            <View style={styles.folderIcon}>
              {preview.length ? (
                <View style={styles.folderPreview}>
                  {preview.map((c) => (
                    <View key={c.id} style={[styles.folderDot, { backgroundColor: c.color || theme.accent }]}>
                      <Text style={styles.folderDotLabel}>{c.label || c.name.charAt(0)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Ionicons name="folder-outline" size={26} color={theme.text} />
              )}
            </View>
            <Text numberOfLines={1} style={[styles.tileName, { color: theme.text }]}>{item.name}</Text>
          </Glass>
        </Pressable>
      );
    }
    return (
      <Pressable
        key={item.id}
        onPress={() => onOpen(item.url)}
        onLongPress={() => setModal({ type: 'context', item, parentFolderId })}
        delayLongPress={350}
        style={({ pressed }) => [styles.tileWrap, pressed && { opacity: 0.6, transform: [{ scale: 0.96 }] }]}
      >
        <Glass theme={theme} style={styles.tile} intensity={50} hairline>
          <View style={[styles.tileIcon, { backgroundColor: item.color }]}>
            <Text style={styles.tileLabel}>{item.label || item.name.charAt(0)}</Text>
          </View>
          <Text numberOfLines={1} style={[styles.tileName, { color: theme.text }]}>{item.name}</Text>
        </Glass>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sites favoris</Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Pressable onPress={() => setModal({ type: 'addFolder' })} hitSlop={8}>
              <Ionicons name="folder-open-outline" size={22} color={theme.accent} />
            </Pressable>
            <Pressable onPress={() => setModal({ type: 'addSite', folderId: null })} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={24} color={theme.accent} />
            </Pressable>
          </View>
        </View>

        <View style={styles.grid}>
          {items.map((it) => renderTile(it, null))}
        </View>
        <Text style={[styles.hint, { color: theme.subtext }]}>Astuce : appui long sur un raccourci pour le modifier, le déplacer ou le supprimer.</Text>
      </ScrollView>

      {/* --- Dossier ouvert --- */}
      <Modal visible={!!currentFolder} transparent animationType="fade" onRequestClose={() => setOpenFolder(null)}>
        <View style={styles.folderOverlay}>
          <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={styles.folderHeader}>
            <Pressable onPress={() => setOpenFolder(null)} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color={theme.accent} />
            </Pressable>
            <Text numberOfLines={1} style={[styles.folderTitle, { color: theme.text }]}>{currentFolder ? currentFolder.name : ''}</Text>
            <Pressable onPress={() => setModal({ type: 'addSite', folderId: openFolder })} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={24} color={theme.accent} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.grid}>
              {currentFolder && (currentFolder.items || []).map((c) => renderTile(c, currentFolder.id))}
            </View>
            {currentFolder && (currentFolder.items || []).length === 0 ? (
              <Text style={[styles.hint, { color: theme.subtext, textAlign: 'center', marginTop: 30 }]}>
                Dossier vide. Touche + pour ajouter un raccourci.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      {/* --- Menus / formulaires --- */}
      <SheetModal
        theme={theme}
        modal={modal}
        folders={folders}
        onClose={() => setModal(null)}
        onOpenSite={(url) => { setModal(null); onOpen(url); }}
        onAddSite={(name, url, folderId) => { addSite(name, url, folderId); setModal(null); }}
        onAddFolder={(name) => { addFolder(name); setModal(null); }}
        onRename={(id, name, parent) => { renameItem(id, name, parent); setModal(null); }}
        onDelete={(id, parent) => { deleteItem(id, parent); setModal(null); }}
        onMove={(siteId, from, to) => { moveSite(siteId, from, to); setModal(null); }}
      />
    </View>
  );
}

// ---------- Modale multi-usage (contexte, ajout, renommage, déplacement) ----------
function SheetModal({ theme, modal, folders, onClose, onOpenSite, onAddSite, onAddFolder, onRename, onDelete, onMove }) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    if (!modal) return;
    if (modal.type === 'rename') setName(modal.item.name);
    else setName('');
    setUrl('');
  }, [modal]);

  if (!modal) return null;

  const Header = ({ title }) => (
    <>
      <View style={[styles.handle, { backgroundColor: theme.border }]} />
      <Text style={[styles.sheetTitle, { color: theme.text }]}>{title}</Text>
    </>
  );

  const Row = ({ icon, label, onPress, danger }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
      <Ionicons name={icon} size={21} color={danger ? theme.danger : theme.text} style={{ width: 30 }} />
      <Text style={[styles.menuLabel, { color: danger ? theme.danger : theme.text }]}>{label}</Text>
    </Pressable>
  );

  let body = null;

  if (modal.type === 'context') {
    const it = modal.item;
    const parent = modal.parentFolderId;
    body = (
      <>
        <Header title={it.name} />
        {it.type === 'site' ? <Row icon="open-outline" label="Ouvrir" onPress={() => onOpenSite(it.url)} /> : null}
        <RenameInline theme={theme} item={it} parent={parent} onRename={onRename} />
        {it.type === 'site' ? (
          <MoveInline theme={theme} item={it} parent={parent} folders={folders} onMove={onMove} />
        ) : null}
        <Row icon="trash-outline" label="Supprimer" danger onPress={() => onDelete(it.id, parent)} />
      </>
    );
  } else if (modal.type === 'addSite') {
    body = (
      <>
        <Header title={modal.folderId ? 'Ajouter dans le dossier' : 'Nouveau raccourci'} />
        <Field theme={theme} label="Nom" value={name} onChange={setName} placeholder="Ex : Mon site" />
        <Field theme={theme} label="Adresse" value={url} onChange={setUrl} placeholder="exemple.com" keyboardType="url" />
        <PrimaryBtn theme={theme} label="Ajouter" disabled={!url.trim()} onPress={() => onAddSite(name.trim() || url.trim(), url.trim(), modal.folderId)} />
      </>
    );
  } else if (modal.type === 'addFolder') {
    body = (
      <>
        <Header title="Nouveau dossier" />
        <Field theme={theme} label="Nom du dossier" value={name} onChange={setName} placeholder="Ex : Réseaux" />
        <PrimaryBtn theme={theme} label="Créer" disabled={!name.trim()} onPress={() => onAddFolder(name.trim())} />
      </>
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { borderColor: theme.glassBorder }]} onPress={() => {}}>
          <Glass theme={theme} border={false} intensity={75} style={StyleSheet.absoluteFill} />
          <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 26 }}>{body}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function RenameInline({ theme, item, parent, onRename }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState(item.name);
  if (!open) {
    return (
      <Pressable onPress={() => { setVal(item.name); setOpen(true); }} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
        <Ionicons name="create-outline" size={21} color={theme.text} style={{ width: 30 }} />
        <Text style={[styles.menuLabel, { color: theme.text }]}>Renommer</Text>
      </Pressable>
    );
  }
  return (
    <View style={{ paddingHorizontal: 18, paddingVertical: 8 }}>
      <TextInput
        value={val}
        onChangeText={setVal}
        autoFocus
        placeholder="Nouveau nom"
        placeholderTextColor={theme.subtext}
        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]}
      />
      <PrimaryBtn theme={theme} label="Enregistrer" disabled={!val.trim()} onPress={() => onRename(item.id, val.trim(), parent)} />
    </View>
  );
}

function MoveInline({ theme, item, parent, folders, onMove }) {
  const [open, setOpen] = React.useState(false);
  const targets = folders.filter((f) => f.id !== parent);
  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
        <Ionicons name="folder-outline" size={21} color={theme.text} style={{ width: 30 }} />
        <Text style={[styles.menuLabel, { color: theme.text }]}>Déplacer vers…</Text>
      </Pressable>
    );
  }
  return (
    <View style={{ paddingLeft: 18 }}>
      {parent ? (
        <Pressable onPress={() => onMove(item.id, parent, null)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
          <Ionicons name="arrow-up-outline" size={21} color={theme.text} style={{ width: 30 }} />
          <Text style={[styles.menuLabel, { color: theme.text }]}>Sortir du dossier (racine)</Text>
        </Pressable>
      ) : null}
      {targets.length === 0 ? (
        <Text style={{ color: theme.subtext, paddingHorizontal: 12, paddingVertical: 10 }}>Aucun autre dossier. Crée un dossier d'abord.</Text>
      ) : targets.map((f) => (
        <Pressable key={f.id} onPress={() => onMove(item.id, parent, f.id)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
          <Ionicons name="folder" size={21} color={theme.accent} style={{ width: 30 }} />
          <Text style={[styles.menuLabel, { color: theme.text }]}>{f.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Field({ theme, label, value, onChange, placeholder, keyboardType }) {
  return (
    <View style={{ paddingHorizontal: 18, marginBottom: 12 }}>
      <Text style={{ color: theme.subtext, fontSize: 12, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.subtext}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]}
      />
    </View>
  );
}

function PrimaryBtn({ theme, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.primaryBtn, { backgroundColor: disabled ? theme.subtext : theme.accent }, pressed && !disabled && { opacity: 0.85 }]}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingTop: 30, paddingBottom: 120 },
  incognitoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center',
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, marginBottom: 18,
  },
  brand: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 22, letterSpacing: 0.3 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 26,
    paddingHorizontal: 18, height: 52, marginBottom: 26,
  },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  tileWrap: { width: '25%', paddingHorizontal: 4, marginBottom: 14 },
  tile: { borderRadius: 20, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  tileIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  tileLabel: { color: '#fff', fontSize: 22, fontWeight: '800' },
  tileName: { fontSize: 11, textAlign: 'center' },
  folderIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 7, backgroundColor: 'rgba(128,128,128,0.18)' },
  folderPreview: { width: 34, height: 34, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between' },
  folderDot: { width: 15, height: 15, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  folderDotLabel: { color: '#fff', fontSize: 9, fontWeight: '800' },
  hint: { fontSize: 12, marginTop: 8, paddingHorizontal: 4, lineHeight: 17 },
  // folder overlay
  folderOverlay: { flex: 1 },
  folderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 44, paddingHorizontal: 16, paddingBottom: 8 },
  folderTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', marginHorizontal: 8 },
  // sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, maxHeight: '80%', borderTopWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginVertical: 8 },
  sheetTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 10, paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  menuLabel: { fontSize: 16, marginLeft: 6 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  primaryBtn: { marginHorizontal: 18, marginTop: 10, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
});
