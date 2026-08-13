// Page d'accueil : fond Lamborghini + barre chat IA + raccourcis RONDS sur une ligne en bas.
// Dossiers, appui long (renommer / déplacer / supprimer), ajout.
import React from 'react';
import {
  ImageBackground,
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

const WALLPAPER = require('../../assets/wallpaper.jpg');

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

export default function HomeScreen({ theme, incognito, onOpen, onSearch, onAsk }) {
  const [q, setQ] = React.useState('');
  const [mode, setMode] = React.useState('ia'); // 'ia' | 'web'
  const [items, setItems] = React.useState(DEFAULT_ITEMS);
  const [openFolder, setOpenFolder] = React.useState(null);
  const [modal, setModal] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const saved = await store.loadShortcuts(null);
      if (Array.isArray(saved) && saved.length) setItems(saved);
      setLoaded(true);
    })();
  }, []);
  React.useEffect(() => { if (loaded) store.saveShortcuts(items); }, [items, loaded]);

  const folders = items.filter((i) => i.type === 'folder');
  const currentFolder = openFolder ? items.find((i) => i.id === openFolder && i.type === 'folder') : null;

  const submit = () => {
    const v = q.trim();
    if (!v) return;
    if (mode === 'ia') onAsk(v); else onSearch(v);
    setQ('');
  };

  // ---- Opérations ----
  const addSite = (name, url, folderId) => {
    const site = {
      id: sid(), type: 'site', name: name || url, url: normalizeUrl(url),
      color: PALETTE[(name || url).length % PALETTE.length],
      label: (name || url).trim().charAt(0).toUpperCase(),
    };
    setItems((prev) => (!folderId ? [...prev, site] : prev.map((it) => (it.id === folderId ? { ...it, items: [...(it.items || []), site] } : it))));
  };
  const addFolder = (name) => setItems((prev) => [...prev, { id: 'f_' + sid(), type: 'folder', name: name || 'Dossier', items: [] }]);
  const renameItem = (id, name, parent) => setItems((prev) => prev.map((it) => {
    if (parent && it.id === parent) return { ...it, items: (it.items || []).map((c) => (c.id === id ? { ...c, name } : c)) };
    if (!parent && it.id === id) return { ...it, name };
    return it;
  }));
  const deleteItem = (id, parent) => setItems((prev) => {
    if (parent) return prev.map((it) => (it.id === parent ? { ...it, items: (it.items || []).filter((c) => c.id !== id) } : it));
    const target = prev.find((it) => it.id === id);
    if (target && target.type === 'folder' && (target.items || []).length) return [...prev.filter((it) => it.id !== id), ...target.items];
    return prev.filter((it) => it.id !== id);
  });
  const moveSite = (siteId, from, to) => setItems((prev) => {
    let site = null;
    let next = prev.map((it) => {
      if (from && it.id === from) { const f = (it.items || []).find((c) => c.id === siteId); if (f) site = f; return { ...it, items: (it.items || []).filter((c) => c.id !== siteId) }; }
      return it;
    });
    if (!from) { site = prev.find((it) => it.id === siteId) || null; next = next.filter((it) => it.id !== siteId); }
    if (!site) return prev;
    if (!to) return [...next, site];
    return next.map((it) => (it.id === to ? { ...it, items: [...(it.items || []), site] } : it));
  });

  // ---- Raccourci rond ----
  const renderRound = (item, parent) => {
    const isFolder = item.type === 'folder';
    return (
      <Pressable
        key={item.id}
        onPress={() => (isFolder ? setOpenFolder(item.id) : onOpen(item.url))}
        onLongPress={() => setModal({ type: 'context', item, parentFolderId: parent })}
        delayLongPress={320}
        style={({ pressed }) => [styles.round, pressed && { opacity: 0.6, transform: [{ scale: 0.94 }] }]}
      >
        {isFolder ? (
          <Glass theme={theme} style={styles.circle} intensity={55} hairline>
            <Ionicons name="folder" size={22} color={theme.accent} />
          </Glass>
        ) : (
          <View style={[styles.circle, { backgroundColor: item.color }]}>
            <Text style={styles.circleLabel}>{item.label || item.name.charAt(0)}</Text>
          </View>
        )}
        <Text numberOfLines={1} style={styles.roundName}>{item.name}</Text>
      </Pressable>
    );
  };

  const AddButtons = () => (
    <>
      <Pressable onPress={() => setModal({ type: 'addSite', folderId: null })} style={({ pressed }) => [styles.round, pressed && { opacity: 0.6 }]}>
        <Glass theme={theme} style={styles.circle} intensity={55} hairline><Ionicons name="add" size={26} color={theme.text} /></Glass>
        <Text numberOfLines={1} style={styles.roundName}>Ajouter</Text>
      </Pressable>
      <Pressable onPress={() => setModal({ type: 'addFolder' })} style={({ pressed }) => [styles.round, pressed && { opacity: 0.6 }]}>
        <Glass theme={theme} style={styles.circle} intensity={55} hairline><Ionicons name="folder-open-outline" size={22} color={theme.text} /></Glass>
        <Text numberOfLines={1} style={styles.roundName}>Dossier</Text>
      </Pressable>
    </>
  );

  return (
    <ImageBackground source={WALLPAPER} resizeMode="cover" style={{ flex: 1 }}>
      {/* Voile sombre en bas pour la lisibilité */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.82)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bottomWrap}>
        {incognito ? (
          <Glass theme={theme} style={styles.incognitoBanner} intensity={45}>
            <Ionicons name="eye-off" size={15} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Navigation privée</Text>
          </Glass>
        ) : null}

        {/* Barre CHAT IA */}
        <Glass theme={theme} style={styles.aiBar} intensity={70} hairline>
          <Pressable onPress={() => setMode(mode === 'ia' ? 'web' : 'ia')} hitSlop={8} style={styles.aiModeBtn}>
            <Ionicons name={mode === 'ia' ? 'sparkles' : 'globe-outline'} size={20} color={mode === 'ia' ? theme.accent : '#fff'} />
          </Pressable>
          <TextInput
            style={styles.aiInput}
            value={q}
            onChangeText={setQ}
            onSubmitEditing={submit}
            placeholder={mode === 'ia' ? 'Demander à l’IA…' : 'Rechercher sur le web…'}
            placeholderTextColor="rgba(255,255,255,0.6)"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
          />
          <Pressable onPress={submit} hitSlop={8}>
            <Ionicons name="arrow-up-circle" size={30} color={theme.accent} />
          </Pressable>
        </Glass>

        {/* Raccourcis RONDS sur une ligne */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
          {items.map((it) => renderRound(it, null))}
          <AddButtons />
        </ScrollView>
      </View>

      {/* Dossier ouvert */}
      <Modal visible={!!currentFolder} transparent animationType="fade" onRequestClose={() => setOpenFolder(null)}>
        <View style={{ flex: 1 }}>
          <ImageBackground source={WALLPAPER} resizeMode="cover" style={StyleSheet.absoluteFill}>
            <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.88)']} style={StyleSheet.absoluteFill} />
          </ImageBackground>
          <View style={styles.folderHeader}>
            <Pressable onPress={() => setOpenFolder(null)} hitSlop={8}><Ionicons name="chevron-back" size={26} color="#fff" /></Pressable>
            <Text numberOfLines={1} style={styles.folderTitle}>{currentFolder ? currentFolder.name : ''}</Text>
            <Pressable onPress={() => setModal({ type: 'addSite', folderId: openFolder })} hitSlop={8}><Ionicons name="add-circle-outline" size={24} color="#fff" /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.folderGrid}>
            {currentFolder && (currentFolder.items || []).map((c) => renderRound(c, currentFolder.id))}
            {currentFolder && (currentFolder.items || []).length === 0 ? (
              <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', width: '100%', marginTop: 30 }}>Dossier vide. Touche + pour ajouter.</Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      <SheetModal
        theme={theme} modal={modal} folders={folders}
        onClose={() => setModal(null)}
        onOpenSite={(url) => { setModal(null); onOpen(url); }}
        onAddSite={(name, url, folderId) => { addSite(name, url, folderId); setModal(null); }}
        onAddFolder={(name) => { addFolder(name); setModal(null); }}
        onRename={(id, name, parent) => { renameItem(id, name, parent); setModal(null); }}
        onDelete={(id, parent) => { deleteItem(id, parent); setModal(null); }}
        onMove={(siteId, from, to) => { moveSite(siteId, from, to); setModal(null); }}
      />
    </ImageBackground>
  );
}

// ---------- Modale multi-usage ----------
function SheetModal({ theme, modal, folders, onClose, onOpenSite, onAddSite, onAddFolder, onRename, onDelete, onMove }) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  React.useEffect(() => { setName(''); setUrl(''); }, [modal]);
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
    const it = modal.item; const parent = modal.parentFolderId;
    body = (
      <>
        <Header title={it.name} />
        {it.type === 'site' ? <Row icon="open-outline" label="Ouvrir" onPress={() => onOpenSite(it.url)} /> : null}
        <RenameInline theme={theme} item={it} parent={parent} onRename={onRename} />
        {it.type === 'site' ? <MoveInline theme={theme} item={it} parent={parent} folders={folders} onMove={onMove} /> : null}
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
          <Glass theme={theme} border={false} intensity={80} style={StyleSheet.absoluteFill} />
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
      <TextInput value={val} onChangeText={setVal} autoFocus placeholder="Nouveau nom" placeholderTextColor={theme.subtext}
        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]} />
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
          <Text style={[styles.menuLabel, { color: theme.text }]}>Sortir du dossier</Text>
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
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={theme.subtext}
        keyboardType={keyboardType} autoCapitalize="none" autoCorrect={false}
        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]} />
    </View>
  );
}

function PrimaryBtn({ theme, label, onPress, disabled }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.primaryBtn, { backgroundColor: disabled ? theme.subtext : theme.accent }, pressed && !disabled && { opacity: 0.85 }]}>
      <Text style={{ color: theme.onAccent || '#fff', fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottomWrap: { flex: 1, justifyContent: 'flex-end', paddingBottom: 14 },
  incognitoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'center',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 14,
  },
  aiBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 14, borderRadius: 26, paddingHorizontal: 14, height: 54, marginBottom: 14,
  },
  aiModeBtn: { width: 26, alignItems: 'center' },
  aiInput: { flex: 1, fontSize: 15.5, color: '#fff', padding: 0 },
  row: { paddingHorizontal: 14, gap: 14, alignItems: 'flex-start' },
  round: { width: 64, alignItems: 'center' },
  circle: {
    width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  circleLabel: { color: '#fff', fontSize: 22, fontWeight: '800' },
  roundName: { color: '#fff', fontSize: 11, marginTop: 6, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 3 },
  // folder overlay
  folderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 10 },
  folderTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#fff', marginHorizontal: 8 },
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 18, gap: 6, justifyContent: 'flex-start' },
  // sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, maxHeight: '80%', borderTopWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginVertical: 8 },
  sheetTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 10, paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  menuLabel: { fontSize: 16, marginLeft: 6 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  primaryBtn: { marginHorizontal: 18, marginTop: 10, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
});
