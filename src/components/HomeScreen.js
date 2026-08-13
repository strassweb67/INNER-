// Page d'accueil "pro" : logo, recherche (IA/Web), raccourcis ronds, catégories,
// widget météo+heure, outils rapides, onglets récents — sur fond VIDÉO.
import React from 'react';
import {
  Alert,
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
import VideoBackground from './VideoBackground';
import * as store from '../utils/storage';

const PALETTE = ['#4285F4', '#FF0000', '#1877F2', '#E4405F', '#111827', '#24292e', '#FF9900', '#FF3333', '#9146FF', '#25D366', '#00A1F1', '#FF6600'];
let _sid = 0;
const sid = () => `s_${Date.now().toString(36)}_${_sid++}`;

const DEFAULT_ITEMS = [
  { id: 's_g', type: 'site', name: 'Google', url: 'https://www.google.com', color: '#4285F4', label: 'G' },
  { id: 's_yt', type: 'site', name: 'YouTube', url: 'https://m.youtube.com', color: '#FF0000', label: '▶' },
  { id: 's_ig', type: 'site', name: 'Instagram', url: 'https://www.instagram.com', color: '#E4405F', label: '◎' },
  { id: 's_x', type: 'site', name: 'X', url: 'https://x.com', color: '#111827', label: '𝕏' },
  { id: 's_yx', type: 'site', name: 'Yandex', url: 'https://yandex.com', color: '#FF3333', label: 'Y' },
];

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function wmo(code) {
  if (code === 0) return { t: 'Ensoleillé', i: 'sunny' };
  if (code <= 2) return { t: 'Peu nuageux', i: 'partly-sunny' };
  if (code === 3) return { t: 'Nuageux', i: 'cloud' };
  if (code <= 48) return { t: 'Brouillard', i: 'cloud' };
  if (code <= 67) return { t: 'Pluie', i: 'rainy' };
  if (code <= 77) return { t: 'Neige', i: 'snow' };
  if (code <= 82) return { t: 'Averses', i: 'rainy' };
  if (code <= 86) return { t: 'Neige', i: 'snow' };
  return { t: 'Orage', i: 'thunderstorm' };
}

function normalizeUrl(u) {
  const t = (u || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://' + t;
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return (url || '').replace(/^https?:\/\//, ''); }
}

// ---------- Widget Météo + Heure ----------
function WeatherClock({ theme }) {
  const [now, setNow] = React.useState(new Date());
  const [w, setW] = React.useState(null);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    let alive = true;
    const load = () => {
      fetch('https://api.open-meteo.com/v1/forecast?latitude=48.5839&longitude=7.7455&current=temperature_2m,apparent_temperature,weather_code&timezone=auto')
        .then((r) => r.json())
        .then((d) => { if (alive && d && d.current) setW({ temp: Math.round(d.current.temperature_2m), feels: Math.round(d.current.apparent_temperature), code: d.current.weather_code }); })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 900000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const cond = w ? wmo(w.code) : null;
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const date = `${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]}`;

  return (
    <Glass theme={theme} style={styles.weather} intensity={55} hairline>
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { opacity: 0.5 }]} />
      <View style={styles.weatherLeft}>
        <Text style={[styles.wCity, { color: theme.text }]}>Strasbourg</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={[styles.wTemp, { color: theme.text }]}>{w ? `${w.temp}°` : '--°'}</Text>
          <Ionicons name={cond ? cond.i : 'partly-sunny'} size={30} color={theme.accent} />
        </View>
        <Text style={[styles.wCond, { color: theme.subtext }]}>{cond ? cond.t : 'Chargement…'}{w ? ` · ressenti ${w.feels}°` : ''}</Text>
      </View>
      <View style={styles.weatherRight}>
        <Text style={[styles.wTime, { color: theme.text }]}>{time}</Text>
        <Text style={[styles.wDate, { color: theme.subtext }]}>{date}</Text>
      </View>
    </Glass>
  );
}

export default function HomeScreen({ theme, incognito, onOpen, onSearch, onAsk, recent, onOpenBookmarks, onOpenHistory, onOpenSettings, onNewTab }) {
  const [q, setQ] = React.useState('');
  const [mode, setMode] = React.useState('web');
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

  const send = (text) => {
    const v = (text != null ? text : q).trim();
    if (!v) return;
    if (mode === 'ia') onAsk(v); else onSearch(v);
    setQ('');
  };

  const addSite = (name, url, folderId) => {
    const site = { id: sid(), type: 'site', name: name || url, url: normalizeUrl(url), color: PALETTE[(name || url).length % PALETTE.length], label: (name || url).trim().charAt(0).toUpperCase() };
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

  const soon = (name) => Alert.alert(name, 'Fonction bientôt disponible 🚧');

  const TOOLS = [
    { icon: 'download-outline', label: 'Téléchargements', color: '#a855f7', onPress: () => soon('Téléchargements') },
    { icon: 'star', label: 'Favoris', color: '#f5c518', onPress: onOpenBookmarks },
    { icon: 'time-outline', label: 'Historique', color: '#34d399', onPress: onOpenHistory },
    { icon: 'create-outline', label: 'Notes', color: '#8b5cf6', onPress: () => soon('Notes') },
    { icon: 'shield-checkmark-outline', label: 'VPN', color: '#3b82f6', onPress: () => soon('VPN') },
    { icon: 'play', label: 'Lecteur Vidéo', color: '#ef4444', onPress: () => soon('Lecteur Vidéo') },
    { icon: 'color-palette-outline', label: 'Thème', color: '#22d3ee', onPress: onOpenSettings },
    { icon: 'apps-outline', label: 'Plus d’outils', color: '#f472b6', onPress: onOpenSettings },
  ];

  const CATEGORIES = ['Actus', 'Tech', 'Gaming', 'Sport'];

  const renderRound = (item, parent) => {
    const isFolder = item.type === 'folder';
    return (
      <Pressable key={item.id} onPress={() => (isFolder ? setOpenFolder(item.id) : onOpen(item.url))}
        onLongPress={() => setModal({ type: 'context', item, parentFolderId: parent })} delayLongPress={320}
        style={({ pressed }) => [styles.round, pressed && { transform: [{ scale: 0.93 }] }]}>
        <View style={styles.circleShadow}>
          {isFolder ? (
            <Glass theme={theme} style={styles.circle} intensity={60} hairline><Ionicons name="folder" size={22} color={theme.accent} /></Glass>
          ) : (
            <View style={[styles.circle, styles.circleRing, { backgroundColor: item.color }]}>
              <Text style={styles.circleLabel}>{item.label || item.name.charAt(0)}</Text>
              <LinearGradient colors={['rgba(255,255,255,0.35)', 'transparent']} style={styles.circleGloss} />
            </View>
          )}
        </View>
        <Text numberOfLines={1} style={styles.roundName}>{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <VideoBackground />
      <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.72)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <Text style={styles.logo}>NE<Text style={{ color: theme.accent }}>XX</Text></Text>

        {/* Recherche (glow) */}
        <View style={[styles.searchGlow, { borderColor: theme.accent, shadowColor: theme.accent }]}>
          <Glass theme={theme} style={styles.searchBar} intensity={65} border={false}>
            <Pressable onPress={() => setMode(mode === 'ia' ? 'web' : 'ia')} hitSlop={8} style={{ width: 26, alignItems: 'center' }}>
              <Ionicons name={mode === 'ia' ? 'sparkles' : 'search'} size={19} color={mode === 'ia' ? theme.accent : theme.subtext} />
            </Pressable>
            <TextInput style={styles.searchInput} value={q} onChangeText={setQ} onSubmitEditing={() => send()}
              placeholder={mode === 'ia' ? 'Demander à l’IA…' : 'Rechercher ou entrer une URL'} placeholderTextColor={theme.subtext}
              autoCapitalize="none" autoCorrect={false} returnKeyType="go" />
            <Pressable onPress={() => send()} hitSlop={8}><Ionicons name="arrow-forward-circle" size={26} color={theme.accent} /></Pressable>
          </Glass>
        </View>
        {incognito ? <Text style={styles.incognitoTxt}>🕶️ Navigation privée</Text> : null}

        {/* Raccourcis ronds */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowShort} keyboardShouldPersistTaps="handled">
          {items.map((it) => renderRound(it, null))}
          <Pressable onPress={() => setModal({ type: 'addSite', folderId: null })} style={styles.round}>
            <View style={styles.circleShadow}><Glass theme={theme} style={styles.circle} intensity={60} hairline><Ionicons name="add" size={26} color={theme.text} /></Glass></View>
            <Text numberOfLines={1} style={styles.roundName}>Ajouter</Text>
          </Pressable>
          <Pressable onPress={() => setModal({ type: 'addFolder' })} style={styles.round}>
            <View style={styles.circleShadow}><Glass theme={theme} style={styles.circle} intensity={60} hairline><Ionicons name="folder-open-outline" size={21} color={theme.text} /></Glass></View>
            <Text numberOfLines={1} style={styles.roundName}>Dossier</Text>
          </Pressable>
        </ScrollView>

        {/* Catégories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => onSearch(c + ' actualités')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Glass theme={theme} style={styles.chip} intensity={45} hairline><Text style={[styles.chipTxt, { color: theme.text }]}>{c}</Text></Glass>
            </Pressable>
          ))}
        </ScrollView>

        {/* Météo + heure */}
        <WeatherClock theme={theme} />

        {/* Outils rapides */}
        <Text style={styles.sectionTitle}>OUTILS RAPIDES</Text>
        <Glass theme={theme} style={styles.toolsCard} intensity={45} hairline>
          <View style={styles.toolsGrid}>
            {TOOLS.map((t) => (
              <Pressable key={t.label} onPress={t.onPress} style={({ pressed }) => [styles.tool, pressed && { opacity: 0.55 }]}>
                <View style={[styles.toolIcon, { borderColor: t.color }]}><Ionicons name={t.icon} size={24} color={t.color} /></View>
                <Text numberOfLines={1} style={[styles.toolLabel, { color: theme.text }]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </Glass>

        {/* Onglets récents */}
        <View style={styles.recentHead}>
          <Text style={styles.sectionTitle}>ONGLETS RÉCENTS</Text>
          <Pressable onPress={onOpenHistory} hitSlop={8}><Text style={[styles.seeAll, { color: theme.accent }]}>Tout voir</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
          {(recent || []).slice(0, 6).map((h) => (
            <Pressable key={h.id || h.url} onPress={() => onOpen(h.url)} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
              <Glass theme={theme} style={styles.recentCard} intensity={45} hairline>
                <View style={[styles.recentFav, { backgroundColor: theme.inputBg }]}><Text style={{ color: theme.text, fontWeight: '800' }}>{domainOf(h.url).charAt(0).toUpperCase()}</Text></View>
                <Text numberOfLines={1} style={[styles.recentDomain, { color: theme.subtext }]}>{domainOf(h.url)}</Text>
              </Glass>
            </Pressable>
          ))}
          <Pressable onPress={onNewTab} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <Glass theme={theme} style={[styles.recentCard, { alignItems: 'center', justifyContent: 'center' }]} intensity={45} hairline>
              <Ionicons name="add" size={30} color={theme.subtext} />
            </Glass>
          </Pressable>
        </ScrollView>
      </ScrollView>

      {/* Dossier ouvert */}
      <Modal visible={!!currentFolder} transparent animationType="fade" onRequestClose={() => setOpenFolder(null)}>
        <View style={{ flex: 1 }}>
          <VideoBackground />
          <LinearGradient colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
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

      <SheetModal theme={theme} modal={modal} folders={folders} onClose={() => setModal(null)}
        onOpenSite={(url) => { setModal(null); onOpen(url); }}
        onAddSite={(name, url, folderId) => { addSite(name, url, folderId); setModal(null); }}
        onAddFolder={(name) => { addFolder(name); setModal(null); }}
        onRename={(id, name, parent) => { renameItem(id, name, parent); setModal(null); }}
        onDelete={(id, parent) => { deleteItem(id, parent); setModal(null); }}
        onMove={(siteId, from, to) => { moveSite(siteId, from, to); setModal(null); }} />
    </View>
  );
}

// ---------- Modale multi-usage ----------
function SheetModal({ theme, modal, folders, onClose, onOpenSite, onAddSite, onAddFolder, onRename, onDelete, onMove }) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  React.useEffect(() => { setName(''); setUrl(''); }, [modal]);
  if (!modal) return null;
  const Header = ({ title }) => (<><View style={[styles.handle, { backgroundColor: theme.border }]} /><Text style={[styles.sheetTitle, { color: theme.text }]}>{title}</Text></>);
  const Row = ({ icon, label, onPress, danger }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
      <Ionicons name={icon} size={21} color={danger ? theme.danger : theme.text} style={{ width: 30 }} />
      <Text style={[styles.menuLabel, { color: danger ? theme.danger : theme.text }]}>{label}</Text>
    </Pressable>
  );
  let body = null;
  if (modal.type === 'context') {
    const it = modal.item; const parent = modal.parentFolderId;
    body = (<>
      <Header title={it.name} />
      {it.type === 'site' ? <Row icon="open-outline" label="Ouvrir" onPress={() => onOpenSite(it.url)} /> : null}
      <RenameInline theme={theme} item={it} parent={parent} onRename={onRename} />
      {it.type === 'site' ? <MoveInline theme={theme} item={it} parent={parent} folders={folders} onMove={onMove} /> : null}
      <Row icon="trash-outline" label="Supprimer" danger onPress={() => onDelete(it.id, parent)} />
    </>);
  } else if (modal.type === 'addSite') {
    body = (<>
      <Header title={modal.folderId ? 'Ajouter dans le dossier' : 'Nouveau raccourci'} />
      <Field theme={theme} label="Nom" value={name} onChange={setName} placeholder="Ex : Mon site" />
      <Field theme={theme} label="Adresse" value={url} onChange={setUrl} placeholder="exemple.com" keyboardType="url" />
      <PrimaryBtn theme={theme} label="Ajouter" disabled={!url.trim()} onPress={() => onAddSite(name.trim() || url.trim(), url.trim(), modal.folderId)} />
    </>);
  } else if (modal.type === 'addFolder') {
    body = (<>
      <Header title="Nouveau dossier" />
      <Field theme={theme} label="Nom du dossier" value={name} onChange={setName} placeholder="Ex : Réseaux" />
      <PrimaryBtn theme={theme} label="Créer" disabled={!name.trim()} onPress={() => onAddFolder(name.trim())} />
    </>);
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
  if (!open) return (
    <Pressable onPress={() => { setVal(item.name); setOpen(true); }} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
      <Ionicons name="create-outline" size={21} color={theme.text} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>Renommer</Text>
    </Pressable>
  );
  return (
    <View style={{ paddingHorizontal: 18, paddingVertical: 8 }}>
      <TextInput value={val} onChangeText={setVal} autoFocus placeholder="Nouveau nom" placeholderTextColor={theme.subtext} style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]} />
      <PrimaryBtn theme={theme} label="Enregistrer" disabled={!val.trim()} onPress={() => onRename(item.id, val.trim(), parent)} />
    </View>
  );
}

function MoveInline({ theme, item, parent, folders, onMove }) {
  const [open, setOpen] = React.useState(false);
  const targets = folders.filter((f) => f.id !== parent);
  if (!open) return (
    <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
      <Ionicons name="folder-outline" size={21} color={theme.text} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>Déplacer vers…</Text>
    </Pressable>
  );
  return (
    <View style={{ paddingLeft: 18 }}>
      {parent ? (
        <Pressable onPress={() => onMove(item.id, parent, null)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
          <Ionicons name="arrow-up-outline" size={21} color={theme.text} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>Sortir du dossier</Text>
        </Pressable>
      ) : null}
      {targets.length === 0 ? (
        <Text style={{ color: theme.subtext, paddingHorizontal: 12, paddingVertical: 10 }}>Aucun autre dossier.</Text>
      ) : targets.map((f) => (
        <Pressable key={f.id} onPress={() => onMove(item.id, parent, f.id)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}>
          <Ionicons name="folder" size={21} color={theme.accent} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>{f.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Field({ theme, label, value, onChange, placeholder, keyboardType }) {
  return (
    <View style={{ paddingHorizontal: 18, marginBottom: 12 }}>
      <Text style={{ color: theme.subtext, fontSize: 12, marginBottom: 6 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={theme.subtext} keyboardType={keyboardType} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]} />
    </View>
  );
}

function PrimaryBtn({ theme, label, onPress, disabled }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [styles.primaryBtn, { backgroundColor: disabled ? theme.subtext : theme.accent }, pressed && !disabled && { opacity: 0.85 }]}>
      <Text style={{ color: theme.onAccent || '#fff', fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 30 },
  logo: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 8, textAlign: 'center', marginBottom: 16, marginTop: 4 },
  searchGlow: { borderWidth: 1.5, borderRadius: 28, shadowOpacity: 0.7, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 27, paddingHorizontal: 16, height: 52 },
  searchInput: { flex: 1, fontSize: 15.5, color: '#fff', padding: 0 },
  incognitoTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center', marginTop: 8 },
  rowShort: { gap: 10, paddingVertical: 18, alignItems: 'flex-start' },
  round: { width: 64, alignItems: 'center' },
  circleShadow: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5, borderRadius: 28 },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  circleRing: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)' },
  circleGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  circleLabel: { color: '#fff', fontSize: 22, fontWeight: '800' },
  roundName: { color: '#fff', fontSize: 11, marginTop: 7, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 },
  chips: { gap: 10, paddingBottom: 6, alignItems: 'center' },
  chip: { borderRadius: 18, paddingHorizontal: 18, paddingVertical: 10 },
  chipTxt: { fontSize: 14, fontWeight: '600' },
  weather: { borderRadius: 20, padding: 18, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', overflow: 'hidden' },
  weatherLeft: {},
  weatherRight: { alignItems: 'flex-end', justifyContent: 'center' },
  wCity: { fontSize: 15, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  wTemp: { fontSize: 40, fontWeight: '300' },
  wCond: { fontSize: 12.5, marginTop: 2 },
  wTime: { fontSize: 34, fontWeight: '300' },
  wDate: { fontSize: 12.5, marginTop: 2 },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginTop: 22, marginBottom: 12 },
  toolsCard: { borderRadius: 20, padding: 8 },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  tool: { width: '25%', alignItems: 'center', paddingVertical: 12 },
  toolIcon: { width: 50, height: 50, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 7, backgroundColor: 'rgba(255,255,255,0.03)' },
  toolLabel: { fontSize: 10.5, textAlign: 'center' },
  recentHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  seeAll: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  recentRow: { gap: 10, paddingBottom: 6 },
  recentCard: { width: 108, height: 84, borderRadius: 16, padding: 12, justifyContent: 'space-between' },
  recentFav: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  recentDomain: { fontSize: 11.5 },
  folderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 10 },
  folderTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#fff', marginHorizontal: 8 },
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 18, gap: 6, justifyContent: 'flex-start' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, maxHeight: '80%', borderTopWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginVertical: 8 },
  sheetTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 10, paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  menuLabel: { fontSize: 16, marginLeft: 6 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  primaryBtn: { marginHorizontal: 18, marginTop: 10, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
});
