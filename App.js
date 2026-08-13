// Mon Navigateur — navigateur web complet Android/iOS (Expo / React Native)
import React from 'react';
import {
  Alert,
  Animated,
  Linking,
  Modal,
  Platform,
  Pressable,
  Share,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { darkTheme, lightTheme } from './src/theme';
import { toUrl, domainOf } from './src/utils/url';
import * as store from './src/utils/storage';

import ProgressBar from './src/components/ProgressBar';
import AddressBar from './src/components/AddressBar';
import Toolbar from './src/components/Toolbar';
import LaserBar from './src/components/LaserBar';
import Menu from './src/components/Menu';
import TabsScreen from './src/components/TabsScreen';
import ListScreen from './src/components/ListScreen';
import HomeScreen from './src/components/HomeScreen';
import Glass from './src/components/Glass';

const BAR_HEIGHT = 52;
const ADDR_HEIGHT = 46;

const SCROLL_INJECT = `(function(){
  if (window.__mnScroll) return; window.__mnScroll = 1;
  var last = 0;
  window.addEventListener('scroll', function(){
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (Math.abs(y - last) > 8) {
      try { window.ReactNativeWebView.postMessage(JSON.stringify({ t:'scroll', dir: y > last ? 'down' : 'up', y: y })); } catch(e){}
      last = y;
    }
  }, { passive: true });
})(); true;`;

let _id = 0;
const makeId = () => `tab_${Date.now().toString(36)}_${_id++}`;

function newTab(incognito = false) {
  return {
    id: makeId(), url: '', currentUrl: '', title: 'Nouvel onglet',
    loading: false, progress: 0, canGoBack: false, canGoForward: false, incognito,
  };
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      const e = this.state.err;
      return (
        <View style={{ flex: 1, backgroundColor: '#0a0a0a', padding: 24, paddingTop: 80 }}>
          <Text style={{ color: '#ff6b6b', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Oups, une erreur est survenue</Text>
          <Text style={{ color: '#ddd', fontSize: 14, marginBottom: 20 }}>{String((e && (e.message || e)) || 'Erreur inconnue')}</Text>
          <Text onPress={() => this.setState({ err: null })} style={{ color: '#0a84ff', fontSize: 16, fontWeight: '600' }}>Réessayer</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function Browser() {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0);
  const bottomInset = Math.max(insets.bottom, 8);

  const scheme = useColorScheme();
  const [themePref, setThemePref] = React.useState('auto');
  const theme = React.useMemo(() => {
    const resolved = themePref === 'auto' ? scheme : themePref;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [themePref, scheme]);

  const [tabs, setTabs] = React.useState([newTab()]);
  const [activeId, setActiveId] = React.useState(() => tabs[0].id);
  const [view, setView] = React.useState('browser');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [bmChooser, setBmChooser] = React.useState(null); // {url,title}

  const webviewRef = React.useRef(null);
  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];
  const onHome = !activeTab.url;

  // Barre d'adresse : animation masquage au défilement
  const addrAnim = React.useRef(new Animated.Value(1)).current;
  const addrShown = React.useRef(true);
  const showAddr = (show) => {
    if (addrShown.current === show) return;
    addrShown.current = show;
    Animated.timing(addrAnim, { toValue: show ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  };

  React.useEffect(() => {
    (async () => {
      try {
        const [b, h, s] = await Promise.all([store.loadBookmarks(), store.loadHistory(), store.loadSettings()]);
        setBookmarks(Array.isArray(b) ? b : []);
        setHistory(Array.isArray(h) ? h : []);
        if (s && s.theme) setThemePref(s.theme);
      } catch (e) {}
    })();
  }, []);
  React.useEffect(() => { store.saveBookmarks(bookmarks); }, [bookmarks]);
  React.useEffect(() => { store.saveHistory(history); }, [history]);
  React.useEffect(() => { showAddr(true); }, [activeId, activeTab.url]);

  const patchTab = React.useCallback((id, patch) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const pushHistory = React.useCallback((url, title, incognito) => {
    if (incognito || !url || /^about:/i.test(url)) return;
    setHistory((prev) => {
      if (prev[0] && prev[0].url === url) return prev;
      return [{ id: makeId(), url, title: title || domainOf(url), time: Date.now() }, ...prev].slice(0, 500);
    });
  }, []);

  const navigateTo = React.useCallback((input, id = activeId) => {
    const target = toUrl(input);
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, url: target, currentUrl: target } : t)));
    setView('browser');
  }, [activeId]);

  const goBack = () => { try { webviewRef.current && webviewRef.current.goBack(); } catch (e) {} };
  const goForward = () => { try { webviewRef.current && webviewRef.current.goForward(); } catch (e) {} };
  const reload = () => { try { webviewRef.current && webviewRef.current.reload(); } catch (e) {} };
  const stop = () => { try { webviewRef.current && webviewRef.current.stopLoading(); } catch (e) {} };
  const goHome = () => patchTab(activeId, { url: '', currentUrl: '', title: 'Nouvel onglet' });

  const addTab = React.useCallback((incognito = false) => {
    const t = newTab(incognito);
    setTabs((prev) => [...prev, t]); setActiveId(t.id); setView('browser');
  }, []);
  const selectTab = (id) => { setActiveId(id); setView('browser'); };
  const closeTab = React.useCallback((id) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) { const fresh = newTab(); setActiveId(fresh.id); return [fresh]; }
      setActiveId((cur) => (cur === id ? next[Math.max(0, idx - 1)].id : cur));
      return next;
    });
  }, []);
  const closeAllTabs = () => { const fresh = newTab(); setTabs([fresh]); setActiveId(fresh.id); setView('browser'); };

  const isBookmarked = bookmarks.some((b) => b.url === activeTab.currentUrl);
  const bookmarkFolders = Array.from(new Set(bookmarks.map((b) => b.folder).filter(Boolean)));

  const toggleBookmark = () => {
    const url = activeTab.currentUrl;
    if (!url) return;
    if (bookmarks.some((b) => b.url === url)) {
      setBookmarks((prev) => prev.filter((b) => b.url !== url));
    } else {
      setBmChooser({ url, title: activeTab.title || domainOf(url) });
    }
  };
  const confirmBookmark = (folder) => {
    if (!bmChooser) return;
    setBookmarks((prev) => [{ id: makeId(), url: bmChooser.url, title: bmChooser.title, folder: folder || null }, ...prev]);
    setBmChooser(null);
  };

  const toggleTheme = () => {
    const next = theme.mode === 'dark' ? 'light' : 'dark';
    setThemePref(next); store.saveSettings({ theme: next });
  };
  const sharePage = async () => { try { await Share.share({ message: activeTab.currentUrl, url: activeTab.currentUrl }); } catch (e) {} };

  const onShouldStart = (req) => {
    const u = (req && req.url) || '';
    if (/^(https?|about|data|file|blob):/i.test(u)) return true;
    Linking.openURL(u).catch(() => {});
    return false;
  };
  const onMessage = (e) => {
    try {
      const d = JSON.parse(e.nativeEvent.data);
      if (d && d.t === 'scroll') showAddr(!(d.dir === 'down' && d.y > 60));
    } catch (err) {}
  };

  const menuActions = {
    newTab: () => { setMenuOpen(false); addTab(false); },
    incognito: () => { setMenuOpen(false); addTab(true); },
    toggleBookmark: () => { setMenuOpen(false); toggleBookmark(); },
    openBookmarks: () => { setMenuOpen(false); setView('bookmarks'); },
    openHistory: () => { setMenuOpen(false); setView('history'); },
    share: () => { setMenuOpen(false); sharePage(); },
    reload: () => { setMenuOpen(false); reload(); },
    toggleTheme: () => { toggleTheme(); },
  };

  const contentBottom = bottomInset + 8 + BAR_HEIGHT + 6;

  if (view === 'tabs') {
    return (
      <TabsScreen
        theme={theme} tabs={tabs} activeTabId={activeId}
        onSelect={selectTab} onClose={closeTab} onNewTab={() => addTab(false)}
        onDone={() => setView('browser')} onCloseAll={closeAllTabs} bottomInset={bottomInset}
      />
    );
  }

  if (view === 'bookmarks' || view === 'history') {
    const isBook = view === 'bookmarks';
    return (
      <ListScreen
        theme={theme} title={isBook ? 'Favoris' : 'Historique'}
        icon={isBook ? 'star-outline' : 'time-outline'}
        items={isBook ? bookmarks : history}
        emptyText={isBook ? 'Aucun favori pour le moment' : 'Aucun historique'}
        onOpen={(url) => navigateTo(url)}
        onDelete={(item) => isBook ? setBookmarks((p) => p.filter((b) => b.url !== item.url)) : setHistory((p) => p.filter((h) => h.id !== item.id))}
        onClearAll={() => Alert.alert(isBook ? 'Vider les favoris ?' : 'Effacer l’historique ?', 'Cette action est irréversible.', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Confirmer', style: 'destructive', onPress: () => (isBook ? setBookmarks([]) : setHistory([])) },
        ])}
        onBack={() => setView('browser')}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.chromeBg }}>
      <View style={{ height: topInset, backgroundColor: theme.chromeBg }} />

      {!onHome && (
        <Animated.View
          style={{
            height: addrAnim.interpolate({ inputRange: [0, 1], outputRange: [0, ADDR_HEIGHT] }),
            opacity: addrAnim, overflow: 'hidden',
          }}
        >
          <View style={styles.addressRow}>
            <AddressBar theme={theme} url={activeTab.currentUrl} loading={activeTab.loading}
              onSubmit={(v) => navigateTo(v)} onReload={reload} onStop={stop} />
          </View>
        </Animated.View>
      )}

      {!onHome && (
        <ProgressBar theme={theme} progress={activeTab.progress} visible={activeTab.loading && activeTab.progress < 1} />
      )}

      {/* Contenu (au-dessus de la barre flottante) */}
      <View style={{ flex: 1, backgroundColor: theme.bg, marginBottom: contentBottom }}>
        {onHome ? (
          <HomeScreen theme={theme} incognito={activeTab.incognito} onOpen={(url) => navigateTo(url)} onSearch={(qq) => navigateTo(qq)} />
        ) : (
          <WebView
            key={activeTab.id}
            ref={(r) => { webviewRef.current = r; }}
            source={{ uri: activeTab.url }}
            originWhitelist={['*']}
            incognito={activeTab.incognito}
            injectedJavaScript={SCROLL_INJECT}
            onMessage={onMessage}
            onShouldStartLoadWithRequest={onShouldStart}
            onLoadProgress={({ nativeEvent }) => patchTab(activeTab.id, { progress: nativeEvent.progress })}
            onLoadStart={() => patchTab(activeTab.id, { loading: true })}
            onLoadEnd={() => patchTab(activeTab.id, { loading: false, progress: 1 })}
            onNavigationStateChange={(nav) => {
              patchTab(activeTab.id, { currentUrl: nav.url, title: nav.title, canGoBack: nav.canGoBack, canGoForward: nav.canGoForward });
              if (!nav.loading) pushHistory(nav.url, nav.title, activeTab.incognito);
            }}
            allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false}
            domStorageEnabled javaScriptEnabled startInLoadingState
          />
        )}
      </View>

      {/* Barre flottante laser (au-dessus de la barre système) */}
      <View style={{ position: 'absolute', left: 14, right: 14, bottom: bottomInset + 8 }}>
        <LaserBar theme={theme}>
          <Toolbar
            theme={theme} canGoBack={activeTab.canGoBack} canGoForward={activeTab.canGoForward}
            tabCount={tabs.length} onBack={goBack} onForward={goForward} onHome={goHome}
            onTabs={() => setView('tabs')} onMenu={() => setMenuOpen(true)}
          />
        </LaserBar>
      </View>

      <Menu theme={theme} visible={menuOpen} onClose={() => setMenuOpen(false)} isBookmarked={isBookmarked} actions={menuActions} />

      {/* Choix du dossier pour un favori */}
      <BookmarkFolderModal
        theme={theme} visible={!!bmChooser} folders={bookmarkFolders}
        onClose={() => setBmChooser(null)} onConfirm={confirmBookmark}
      />
    </View>
  );
}

function BookmarkFolderModal({ theme, visible, folders, onClose, onConfirm }) {
  const [newFolder, setNewFolder] = React.useState('');
  React.useEffect(() => { if (!visible) setNewFolder(''); }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { borderColor: theme.glassBorder }]} onPress={() => {}}>
          <Glass theme={theme} border={false} intensity={75} style={StyleSheet.absoluteFill} />
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <Text style={[styles.sheetTitle, { color: theme.text }]}>Ajouter aux favoris</Text>

          <Pressable onPress={() => onConfirm(null)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.inputBg }]}>
            <Ionic name="bookmark-outline" color={theme.text} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Sans dossier</Text>
          </Pressable>
          {folders.map((f) => (
            <Pressable key={f} onPress={() => onConfirm(f)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.inputBg }]}>
              <Ionic name="folder" color={theme.accent} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>{f}</Text>
            </Pressable>
          ))}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, marginTop: 8, marginBottom: 20 }}>
            <TextInput
              value={newFolder} onChangeText={setNewFolder}
              placeholder="Nouveau dossier…" placeholderTextColor={theme.subtext}
              style={{ flex: 1, backgroundColor: theme.inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: theme.text, fontSize: 15 }}
            />
            <Pressable
              onPress={() => newFolder.trim() && onConfirm(newFolder.trim())}
              style={{ backgroundColor: newFolder.trim() ? theme.accent : theme.subtext, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>OK</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Ionic({ name, color }) {
  return <Ionicons name={name} size={21} color={color} style={{ width: 30 }} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Browser />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  addressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, maxHeight: '75%', borderTopWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginVertical: 8 },
  sheetTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  rowLabel: { fontSize: 16, marginLeft: 6 },
});
