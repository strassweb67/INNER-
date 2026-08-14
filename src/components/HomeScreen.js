// Page d'accueil "pro" (style dashboard) sur fond VIDÉO :
// logo, recherche IA/Web, accès rapide, météo + actus, outils, onglets récents, Mémoire Pro.
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
import { MEMO_TYPES } from './MemosScreen';
import * as store from '../utils/storage';

const PALETTE = ['#4285F4', '#FF0000', '#1877F2', '#E4405F', '#111827', '#24292e', '#FF9900', '#FF3333', '#9146FF', '#25D366', '#00A1F1', '#FF6600'];
let _sid = 0;
const sid = () => `s_${Date.now().toString(36)}_${_sid++}`;

const DEFAULT_ITEMS = [
  { id: 's_g', type: 'site', name: 'Google', url: 'https://www.google.com', color: '#4285F4', label: 'G' },
  { id: 's_yt', type: 'site', name: 'YouTube', url: 'https://m.youtube.com', color: '#FF0000', label: '▶' },
  { id: 's_ig', type: 'site', name: 'Instagram', url: 'https://www.instagram.com', color: '#E4405F', label: '◎' },
  { id: 's_tk', type: 'site', name: 'TikTok', url: 'https://www.tiktok.com', color: '#111827', label: '♪' },
  { id: 's_x', type: 'site', name: 'X', url: 'https://x.com', color: '#111827', label: '𝕏' },
];

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const CATEGORIES = ['Actus', 'Tech', 'Gaming', 'Sport', 'Business'];

function wmo(code) {
  if (code === 0) return { t: 'Ensoleillé', i: 'sunny' };
  if (code <= 2) return { t: 'Peu nuageux', i: 'partly-sunny' };
  if (code === 3) return { t: 'Nuageux', i: 'cloud' };
  if (code <= 48) return { t: 'Brouillard', i: 'cloud' };
  if (code <= 67) return { t: 'Pluie', i: 'rainy' };
  if (code <= 77) return { t: 'Neige', i: 'snow' };
  if (code <= 82) return { t: 'Averses', i: 'rainy' };
  return { t: 'Orage', i: 'thunderstorm' };
}
function normalizeUrl(u) { const t = (u || '').trim(); if (!t) return ''; return /^https?:\/\//i.test(t) ? t : 'https://' + t; }
function domainOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return (url || '').replace(/^https?:\/\//, ''); } }

function WeatherClock({ theme }) {
  const [now, setNow] = React.useState(new Date());
  const [w, setW] = React.useState(null);
  React.useEffect(() => { const id = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(id); }, []);
  React.useEffect(() => {
    let alive = true;
    const load = () => fetch('https://api.open-meteo.com/v1/forecast?latitude=48.5839&longitude=7.7455&current=temperature_2m,apparent_temperature,weather_code&timezone=auto')
      .then((r) => r.json()).then((d) => { if (alive && d && d.current) setW({ temp: Math.round(d.current.temperature_2m), feels: Math.round(d.current.apparent_temperature), code: d.current.weather_code }); }).catch(() => {});
    load(); const id = setInterval(load, 900000); return () => { alive = false; clearInterval(id); };
  }, []);
  const cond = w ? wmo(w.code) : null;
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const date = `${JOURS[now.getDay()]} ${now.getDate()} ${MOIS[now.getMonth()]}`;
  return (
    <Glass theme={theme} style={styles.weather} intensity={55} hairline>
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { opacity: 0.55 }]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={[styles.wCity, { color: theme.text }]}>Strasbourg</Text>
        <Ionicons name="location" size={14} color={theme.accent} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <Text style={[styles.wTemp, { color: theme.text }]}>{w ? `${w.temp}°` : '--°'}</Text>
        <Ionicons name={cond ? cond.i : 'partly-sunny'} size={30} color={theme.accent} />
      </View>
      <Text style={[styles.wCond, { color: theme.subtext }]}>{cond ? cond.t : 'Chargement…'}{w ? ` · ressenti ${w.feels}°` : ''}</Text>
      <View style={{ height: 10 }} />
      <Text style={[styles.wTime, { color: theme.text }]}>{time}</Text>
      <Text style={[styles.wDate, { color: theme.subtext }]}>{date}</Text>
    </Glass>
  );
}

function NewsWidget({ theme, onOpen }) {
  const [news, setNews] = React.useState([]);
  React.useEffect(() => {
    let alive = true;
    fetch('https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr').then((r) => r.text()).then((xml) => {
      if (!alive) return;
      const out = []; const re = /<item>([\s\S]*?)<\/item>/g; let m;
      while ((m = re.exec(xml)) && out.length < 4) {
        const block = m[1];
        const tt = /<title>([\s\S]*?)<\/title>/.exec(block);
        const ll = /<link>([\s\S]*?)<\/link>/.exec(block);
        let title = tt ? tt[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
        const parts = title.split(' - '); const source = parts.length > 1 ? parts.pop() : '';
        out.push({ title: parts.join(' - '), source, link: ll ? ll[1].trim() : '' });
      }
      setNews(out);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  return (
    <Glass theme={theme} style={styles.newsCard} intensity={45} hairline>
      <View style={styles.rowBetween}>
        <Text style={[styles.miniTitle, { color: theme.text }]}>ACTUALITÉS</Text>
        <Pressable onPress={() => onOpen('https://news.google.com')} hitSlop={6}><Text style={{ color: theme.accent, fontSize: 12 }}>Voir tout</Text></Pressable>
      </View>
      {news.length === 0 ? (
        <Text style={{ color: theme.subtext, fontSize: 12, marginTop: 8 }}>Chargement des actus…</Text>
      ) : news.map((n, i) => (
        <Pressable key={i} onPress={() => onOpen(n.link || 'https://news.google.com')} style={({ pressed }) => [styles.newsItem, { borderTopColor: theme.border }, pressed && { opacity: 0.6 }]}>
          <Text numberOfLines={2} style={{ color: theme.text, fontSize: 13, lineHeight: 18 }}>{n.title}</Text>
          {n.source ? <Text style={{ color: theme.subtext, fontSize: 11, marginTop: 3 }}>{n.source}</Text> : null}
        </Pressable>
      ))}
    </Glass>
  );
}

export default function HomeScreen(props) {
  const { theme, incognito, onOpen, onSearch, onAsk, memos = [], onOpenMemos, onOpenMemo,
    tabs = [], onSelectTab, onCloseTab, onCloseAllTabs, onOpenBookmarks, onOpenHistory, onOpenSettings, onNewTab } = props;

  const [q, setQ] = React.useState('');
  const [mode, setMode] = React.useState('web');
  const [items, setItems] = React.useState(DEFAULT_ITEMS);
  const [openFolder, setOpenFolder] = React.useState(null);
  const [modal, setModal] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => { (async () => { const s = await store.loadShortcuts(null); if (Array.isArray(s) && s.length) setItems(s); setLoaded(true); })(); }, []);
  React.useEffect(() => { if (loaded) store.saveShortcuts(items); }, [items, loaded]);

  const folders = items.filter((i) => i.type === 'folder');
  const currentFolder = openFolder ? items.find((i) => i.id === openFolder && i.type === 'folder') : null;

  const send = (text) => { const v = (text != null ? text : q).trim(); if (!v) return; if (mode === 'ia') onAsk(v); else onSearch(v); setQ(''); };

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
    let next = prev.map((it) => { if (from && it.id === from) { const f = (it.items || []).find((c) => c.id === siteId); if (f) site = f; return { ...it, items: (it.items || []).filter((c) => c.id !== siteId) }; } return it; });
    if (!from) { site = prev.find((it) => it.id === siteId) || null; next = next.filter((it) => it.id !== siteId); }
    if (!site) return prev; if (!to) return [...next, site];
    return next.map((it) => (it.id === to ? { ...it, items: [...(it.items || []), site] } : it));
  });

  const soon = (name) => Alert.alert(name, 'Fonction bientôt disponible 🚧');
  const TOOLS = [
    { icon: 'download-outline', label: 'Téléchargements', color: '#a855f7', onPress: () => soon('Téléchargements') },
    { icon: 'star', label: 'Favoris', color: '#f5c518', onPress: onOpenBookmarks },
    { icon: 'time-outline', label: 'Historique', color: '#34d399', onPress: onOpenHistory },
    { icon: 'create-outline', label: 'Notes', color: '#8b5cf6', onPress: onOpenMemos },
    { icon: 'moon-outline', label: 'Thème', color: '#a78bfa', onPress: onOpenSettings },
    { icon: 'shield-checkmark-outline', label: 'VPN', color: '#3b82f6', onPress: () => soon('VPN') },
    { icon: 'play', label: 'Lecteur Vidéo', color: '#ef4444', onPress: () => soon('Lecteur Vidéo') },
    { icon: 'sparkles-outline', label: 'Mémoire', color: '#22d3ee', onPress: onOpenMemos },
  ];

  const openTabs = tabs.filter((t) => t && t.url);
  const memoCats = [
    { key: 'all', label: 'Tout', n: memos.length },
    { key: 'text', label: 'Textes', n: memos.filter((m) => m.type === 'text').length },
    { key: 'code', label: 'Codes', n: memos.filter((m) => m.type === 'code').length },
    { key: 'idea', label: 'Idées', n: memos.filter((m) => m.type === 'idea').length },
  ];

  const renderQuick = (item, parent) => {
    const isFolder = item.type === 'folder';
    return (
      <Pressable key={item.id} onPress={() => (isFolder ? setOpenFolder(item.id) : onOpen(item.url))}
        onLongPress={() => setModal({ type: 'context', item, parentFolderId: parent })} delayLongPress={320}
        style={({ pressed }) => [styles.quick, pressed && { transform: [{ scale: 0.93 }] }]}>
        {isFolder ? (
          <Glass theme={theme} style={styles.quickIcon} intensity={55} hairline><Ionicons name="folder" size={24} color={theme.accent} /></Glass>
        ) : (
          <View style={[styles.quickIcon, styles.quickRing, { backgroundColor: item.color }]}>
            <Text style={styles.quickLabel}>{item.label || item.name.charAt(0)}</Text>
            <LinearGradient colors={['rgba(255,255,255,0.3)', 'transparent']} style={styles.quickGloss} />
          </View>
        )}
        <Text numberOfLines={1} style={styles.quickName}>{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <VideoBackground />
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.8)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.logo}><Text style={{ color: '#e11d2a' }}>Osiris</Text><Text style={{ color: '#ffffff' }}> Nav</Text></Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => soon('Bouclier / VPN')} hitSlop={8}><Ionicons name="shield-half" size={22} color={theme.text} /></Pressable>
            <Pressable onPress={onOpenSettings} hitSlop={8}>
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}><Text style={{ color: theme.onAccent, fontWeight: '800' }}>N</Text></View>
            </Pressable>
          </View>
        </View>

        {/* Recherche */}
        <View style={[styles.searchGlow, { borderColor: theme.accent, shadowColor: theme.accent }]}>
          <Glass theme={theme} style={styles.searchBar} intensity={65} border={false}>
            <Pressable onPress={() => setMode(mode === 'ia' ? 'web' : 'ia')} hitSlop={8} style={{ width: 24, alignItems: 'center' }}>
              <Ionicons name={mode === 'ia' ? 'sparkles' : 'search'} size={18} color={mode === 'ia' ? theme.accent : theme.subtext} />
            </Pressable>
            <TextInput style={styles.searchInput} value={q} onChangeText={setQ} onSubmitEditing={() => send()}
              placeholder={mode === 'ia' ? 'Demander à l’IA…' : 'Rechercher ou entrer une URL'} placeholderTextColor={theme.subtext} autoCapitalize="none" autoCorrect={false} returnKeyType="go" />
            <Pressable onPress={() => send()} style={[styles.searchGo, { backgroundColor: theme.accent }]}><Ionicons name="search" size={18} color={theme.onAccent} /></Pressable>
            <Pressable onPress={() => soon('Scanner QR')} hitSlop={8} style={{ marginLeft: 8 }}><Ionicons name="scan-outline" size={22} color={theme.subtext} /></Pressable>
          </Glass>
        </View>

        {/* Catégories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Glass theme={theme} style={[styles.chip, { backgroundColor: theme.accent }]} border={false}>
            <Ionicons name="home" size={14} color={theme.onAccent} /><Text style={[styles.chipTxt, { color: theme.onAccent, marginLeft: 5 }]}>Accueil</Text>
          </Glass>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => onSearch(c + ' actualités')}><Glass theme={theme} style={styles.chip} intensity={40} hairline><Text style={[styles.chipTxt, { color: theme.text }]}>{c}</Text></Glass></Pressable>
          ))}
        </ScrollView>

        {/* Accès rapide */}
        <Glass theme={theme} style={styles.section} intensity={40} hairline>
          <View style={styles.rowBetween}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>⚡ ACCÈS RAPIDE</Text>
            <Pressable onPress={() => setModal({ type: 'addSite', folderId: null })} hitSlop={6}><Text style={{ color: theme.accent, fontSize: 12 }}>Modifier</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 12 }}>
            {items.map((it) => renderQuick(it, null))}
            <Pressable onPress={() => setModal({ type: 'addSite', folderId: null })} style={styles.quick}>
              <Glass theme={theme} style={styles.quickIcon} intensity={55} hairline><Ionicons name="add" size={26} color={theme.text} /></Glass>
              <Text numberOfLines={1} style={styles.quickName}>Ajouter</Text>
            </Pressable>
            <Pressable onPress={() => setModal({ type: 'addFolder' })} style={styles.quick}>
              <Glass theme={theme} style={styles.quickIcon} intensity={55} hairline><Ionicons name="folder-open-outline" size={22} color={theme.text} /></Glass>
              <Text numberOfLines={1} style={styles.quickName}>Dossier</Text>
            </Pressable>
          </ScrollView>
        </Glass>

        {/* Météo + Actus */}
        <WeatherClock theme={theme} />
        <NewsWidget theme={theme} onOpen={onOpen} />

        {/* Outils rapides */}
        <Text style={styles.h2}>OUTILS RAPIDES</Text>
        <Glass theme={theme} style={styles.toolsCard} intensity={40} hairline>
          <View style={styles.toolsGrid}>
            {TOOLS.map((t) => (
              <Pressable key={t.label} onPress={t.onPress} style={({ pressed }) => [styles.tool, pressed && { opacity: 0.55 }]}>
                <View style={[styles.toolIcon, { borderColor: t.color }]}><Ionicons name={t.icon} size={23} color={t.color} /></View>
                <Text numberOfLines={1} style={[styles.toolLabel, { color: theme.text }]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </Glass>

        {/* Onglets récents */}
        {openTabs.length ? (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.h2}>ONGLETS RÉCENTS</Text>
              <Pressable onPress={onCloseAllTabs} hitSlop={6}><Text style={[styles.seeAll, { color: theme.accent }]}>Tout fermer</Text></Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
              {openTabs.slice(0, 8).map((t) => (
                <Pressable key={t.id} onPress={() => onSelectTab(t.id)} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                  <Glass theme={theme} style={styles.recentCard} intensity={45} hairline>
                    <Pressable onPress={() => onCloseTab(t.id)} hitSlop={8} style={styles.recentClose}><Ionicons name="close" size={14} color={theme.subtext} /></Pressable>
                    <View style={[styles.recentFav, { backgroundColor: theme.inputBg }]}><Text style={{ color: theme.text, fontWeight: '800' }}>{domainOf(t.currentUrl || t.url).charAt(0).toUpperCase()}</Text></View>
                    <Text numberOfLines={1} style={{ color: theme.subtext, fontSize: 11.5 }}>{domainOf(t.currentUrl || t.url)}</Text>
                  </Glass>
                </Pressable>
              ))}
              <Pressable onPress={onNewTab}><Glass theme={theme} style={[styles.recentCard, { alignItems: 'center', justifyContent: 'center' }]} intensity={45} hairline><Ionicons name="add" size={30} color={theme.subtext} /></Glass></Pressable>
            </ScrollView>
          </>
        ) : null}

        {/* Mémoire Pro */}
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>✨ MÉMOIRE PRO</Text>
          <Pressable onPress={() => onOpenMemos()} hitSlop={6}><Text style={[styles.seeAll, { color: theme.accent }]}>Voir tout</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
          {memoCats.map((c) => (
            <Glass key={c.key} theme={theme} style={styles.memoCat} intensity={40} hairline><Text style={{ color: theme.text, fontSize: 12.5 }}>{c.label} <Text style={{ color: theme.accent, fontWeight: '800' }}>{c.n}</Text></Text></Glass>
          ))}
        </ScrollView>
        <Glass theme={theme} style={styles.memoCard} intensity={40} hairline>
          {memos.length === 0 ? (
            <Pressable onPress={() => onOpenMemos()} style={{ padding: 18, alignItems: 'center' }}>
              <Ionicons name="sparkles-outline" size={30} color={theme.subtext} />
              <Text style={{ color: theme.subtext, marginTop: 8, fontSize: 13 }}>Crée ton premier mémo — touche ici</Text>
            </Pressable>
          ) : memos.slice(0, 3).map((m, i) => {
            const t = MEMO_TYPES[m.type] || MEMO_TYPES.text;
            return (
              <Pressable key={m.id} onPress={() => onOpenMemo(m.id)} style={({ pressed }) => [styles.memoRow, { borderTopColor: theme.border, borderTopWidth: i ? StyleSheet.hairlineWidth : 0 }, pressed && { opacity: 0.6 }]}>
                <View style={[styles.memoIcon, { borderColor: t.color }]}><Ionicons name={t.icon} size={16} color={t.color} /></View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{m.title}</Text>
                  <Text numberOfLines={1} style={{ color: theme.subtext, fontSize: 12, marginTop: 1 }}>{m.body}</Text>
                </View>
                {m.starred ? <Ionicons name="star" size={16} color="#f5c518" /> : null}
              </Pressable>
            );
          })}
        </Glass>
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
            {currentFolder && (currentFolder.items || []).map((c) => renderQuick(c, currentFolder.id))}
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
      <Ionicons name={icon} size={21} color={danger ? theme.danger : theme.text} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: danger ? theme.danger : theme.text }]}>{label}</Text>
    </Pressable>
  );
  let body = null;
  if (modal.type === 'context') {
    const it = modal.item; const parent = modal.parentFolderId;
    body = (<><Header title={it.name} />{it.type === 'site' ? <Row icon="open-outline" label="Ouvrir" onPress={() => onOpenSite(it.url)} /> : null}
      <RenameInline theme={theme} item={it} parent={parent} onRename={onRename} />
      {it.type === 'site' ? <MoveInline theme={theme} item={it} parent={parent} folders={folders} onMove={onMove} /> : null}
      <Row icon="trash-outline" label="Supprimer" danger onPress={() => onDelete(it.id, parent)} /></>);
  } else if (modal.type === 'addSite') {
    body = (<><Header title={modal.folderId ? 'Ajouter dans le dossier' : 'Nouveau raccourci'} />
      <Field theme={theme} label="Nom" value={name} onChange={setName} placeholder="Ex : Mon site" />
      <Field theme={theme} label="Adresse" value={url} onChange={setUrl} placeholder="exemple.com" keyboardType="url" />
      <PrimaryBtn theme={theme} label="Ajouter" disabled={!url.trim()} onPress={() => onAddSite(name.trim() || url.trim(), url.trim(), modal.folderId)} /></>);
  } else if (modal.type === 'addFolder') {
    body = (<><Header title="Nouveau dossier" /><Field theme={theme} label="Nom du dossier" value={name} onChange={setName} placeholder="Ex : Réseaux" />
      <PrimaryBtn theme={theme} label="Créer" disabled={!name.trim()} onPress={() => onAddFolder(name.trim())} /></>);
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
  const [open, setOpen] = React.useState(false); const [val, setVal] = React.useState(item.name);
  if (!open) return (<Pressable onPress={() => { setVal(item.name); setOpen(true); }} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}><Ionicons name="create-outline" size={21} color={theme.text} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>Renommer</Text></Pressable>);
  return (<View style={{ paddingHorizontal: 18, paddingVertical: 8 }}><TextInput value={val} onChangeText={setVal} autoFocus placeholder="Nouveau nom" placeholderTextColor={theme.subtext} style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]} /><PrimaryBtn theme={theme} label="Enregistrer" disabled={!val.trim()} onPress={() => onRename(item.id, val.trim(), parent)} /></View>);
}
function MoveInline({ theme, item, parent, folders, onMove }) {
  const [open, setOpen] = React.useState(false); const targets = folders.filter((f) => f.id !== parent);
  if (!open) return (<Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}><Ionicons name="folder-outline" size={21} color={theme.text} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>Déplacer vers…</Text></Pressable>);
  return (<View style={{ paddingLeft: 18 }}>
    {parent ? (<Pressable onPress={() => onMove(item.id, parent, null)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}><Ionicons name="arrow-up-outline" size={21} color={theme.text} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>Sortir du dossier</Text></Pressable>) : null}
    {targets.length === 0 ? (<Text style={{ color: theme.subtext, paddingHorizontal: 12, paddingVertical: 10 }}>Aucun autre dossier.</Text>) : targets.map((f) => (<Pressable key={f.id} onPress={() => onMove(item.id, parent, f.id)} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: theme.inputBg }]}><Ionicons name="folder" size={21} color={theme.accent} style={{ width: 30 }} /><Text style={[styles.menuLabel, { color: theme.text }]}>{f.name}</Text></Pressable>))}
  </View>);
}
function Field({ theme, label, value, onChange, placeholder, keyboardType }) {
  return (<View style={{ paddingHorizontal: 18, marginBottom: 12 }}><Text style={{ color: theme.subtext, fontSize: 12, marginBottom: 6 }}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={theme.subtext} keyboardType={keyboardType} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]} /></View>);
}
function PrimaryBtn({ theme, label, onPress, disabled }) {
  return (<Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [styles.primaryBtn, { backgroundColor: disabled ? theme.subtext : theme.accent }, pressed && !disabled && { opacity: 0.85 }]}><Text style={{ color: theme.onAccent || '#fff', fontSize: 16, fontWeight: '700' }}>{label}</Text></Pressable>);
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 30 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, marginTop: 2 },
  logo: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  searchGlow: { borderWidth: 1.5, borderRadius: 28, shadowOpacity: 0.7, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 27, paddingLeft: 16, paddingRight: 8, height: 52 },
  searchInput: { flex: 1, fontSize: 15, color: '#fff', padding: 0 },
  searchGo: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingVertical: 14, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9, overflow: 'hidden' },
  chipTxt: { fontSize: 13.5, fontWeight: '600' },
  section: { borderRadius: 20, padding: 14, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  quick: { width: 68, alignItems: 'center' },
  quickIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  quickRing: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  quickGloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%' },
  quickLabel: { color: '#fff', fontSize: 22, fontWeight: '800' },
  quickName: { color: '#fff', fontSize: 11, marginTop: 6, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 3 },
  weather: { borderRadius: 20, padding: 16, marginBottom: 12, overflow: 'hidden' },
  wCity: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  wTemp: { fontSize: 42, fontWeight: '300' },
  wCond: { fontSize: 12.5, marginTop: 2 },
  wTime: { fontSize: 30, fontWeight: '300' },
  wDate: { fontSize: 12.5, marginTop: 2 },
  newsCard: { borderRadius: 20, padding: 16, marginBottom: 4 },
  miniTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  newsItem: { paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 4 },
  h2: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginTop: 22, marginBottom: 12 },
  toolsCard: { borderRadius: 20, padding: 8 },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  tool: { width: '25%', alignItems: 'center', paddingVertical: 12 },
  toolIcon: { width: 50, height: 50, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 7, backgroundColor: 'rgba(255,255,255,0.03)' },
  toolLabel: { fontSize: 10.5, textAlign: 'center' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  recentRow: { gap: 10, paddingBottom: 6 },
  recentCard: { width: 116, height: 82, borderRadius: 16, padding: 12, justifyContent: 'flex-end' },
  recentClose: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  recentFav: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  memoCat: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
  memoCard: { borderRadius: 20, overflow: 'hidden' },
  memoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  memoIcon: { width: 36, height: 36, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  folderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 10 },
  folderTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#fff', marginHorizontal: 8 },
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 18, gap: 8, justifyContent: 'flex-start' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, maxHeight: '80%', borderTopWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginVertical: 8 },
  sheetTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 10, paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  menuLabel: { fontSize: 16, marginLeft: 6 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  primaryBtn: { marginHorizontal: 18, marginTop: 10, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
});
