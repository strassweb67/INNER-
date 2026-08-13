// Mon Navigateur — navigateur web complet Android/iOS (Expo / React Native)
// Réécrit SANS react-native-safe-area-context (cause d'un crash natif au démarrage).
// Marges gérées manuellement. Filet de sécurité ErrorBoundary intégré.
import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  Share,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { darkTheme, lightTheme } from './src/theme';
import { HOME_URL, toUrl, domainOf } from './src/utils/url';
import * as store from './src/utils/storage';

import ProgressBar from './src/components/ProgressBar';
import AddressBar from './src/components/AddressBar';
import Toolbar from './src/components/Toolbar';
import Menu from './src/components/Menu';
import TabsScreen from './src/components/TabsScreen';
import ListScreen from './src/components/ListScreen';
import HomeScreen from './src/components/HomeScreen';

export const TOP_INSET = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 47;
export const BOTTOM_INSET = 10;

let _id = 0;
const makeId = () => `tab_${Date.now().toString(36)}_${_id++}`;

function newTab(incognito = false) {
  return {
    id: makeId(),
    url: '', // '' => affiche la page d'accueil ; sinon = adresse à charger
    currentUrl: '',
    title: 'Nouvel onglet',
    loading: false,
    progress: 0,
    canGoBack: false,
    canGoForward: false,
    incognito,
  };
}

// ---------- Filet de sécurité : capture toute erreur JS au lieu de crasher ----------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (this.state.err) {
      const e = this.state.err;
      return (
        <View style={{ flex: 1, backgroundColor: '#0a0a0a', padding: 24, paddingTop: 80 }}>
          <Text style={{ color: '#ff6b6b', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            Oups, une erreur est survenue
          </Text>
          <Text style={{ color: '#ddd', fontSize: 14, marginBottom: 20 }}>
            {String((e && (e.message || e)) || 'Erreur inconnue')}
          </Text>
          <Text
            onPress={() => this.setState({ err: null })}
            style={{ color: '#0a84ff', fontSize: 16, fontWeight: '600' }}
          >
            Réessayer
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function Browser() {
  const scheme = useColorScheme();
  const [themePref, setThemePref] = React.useState('auto');
  const theme = React.useMemo(() => {
    const resolved = themePref === 'auto' ? scheme : themePref;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [themePref, scheme]);

  const [tabs, setTabs] = React.useState([newTab()]);
  const [activeId, setActiveId] = React.useState(() => tabs[0].id);
  const [view, setView] = React.useState('browser'); // browser | tabs | bookmarks | history
  const [menuOpen, setMenuOpen] = React.useState(false);

  const [bookmarks, setBookmarks] = React.useState([]);
  const [history, setHistory] = React.useState([]);

  const webviewRef = React.useRef(null);
  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];
  const onHome = !activeTab.url;

  // ---- Chargement initial ----
  React.useEffect(() => {
    (async () => {
      try {
        const [b, h, s] = await Promise.all([
          store.loadBookmarks(),
          store.loadHistory(),
          store.loadSettings(),
        ]);
        setBookmarks(Array.isArray(b) ? b : []);
        setHistory(Array.isArray(h) ? h : []);
        if (s && s.theme) setThemePref(s.theme);
      } catch (e) {}
    })();
  }, []);

  React.useEffect(() => { store.saveBookmarks(bookmarks); }, [bookmarks]);
  React.useEffect(() => { store.saveHistory(history); }, [history]);

  const patchTab = React.useCallback((id, patch) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const pushHistory = React.useCallback((url, title, incognito) => {
    if (incognito || !url || /^about:/i.test(url)) return;
    setHistory((prev) => {
      if (prev[0] && prev[0].url === url) return prev;
      const entry = { id: makeId(), url, title: title || domainOf(url), time: Date.now() };
      return [entry, ...prev].slice(0, 500);
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
    setTabs((prev) => [...prev, t]);
    setActiveId(t.id);
    setView('browser');
  }, []);

  const selectTab = (id) => { setActiveId(id); setView('browser'); };

  const closeTab = React.useCallback((id) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh = newTab();
        setActiveId(fresh.id);
        return [fresh];
      }
      setActiveId((cur) => (cur === id ? next[Math.max(0, idx - 1)].id : cur));
      return next;
    });
  }, []);

  const closeAllTabs = () => {
    const fresh = newTab();
    setTabs([fresh]);
    setActiveId(fresh.id);
    setView('browser');
  };

  const isBookmarked = bookmarks.some((b) => b.url === activeTab.currentUrl);

  const toggleBookmark = () => {
    const url = activeTab.currentUrl;
    if (!url) return;
    setBookmarks((prev) => {
      if (prev.some((b) => b.url === url)) return prev.filter((b) => b.url !== url);
      return [{ id: makeId(), url, title: activeTab.title || domainOf(url) }, ...prev];
    });
  };

  const toggleTheme = () => {
    const next = theme.mode === 'dark' ? 'light' : 'dark';
    setThemePref(next);
    store.saveSettings({ theme: next });
  };

  const sharePage = async () => {
    try { await Share.share({ message: activeTab.currentUrl, url: activeTab.currentUrl }); } catch (e) {}
  };

  const onShouldStart = (req) => {
    const u = (req && req.url) || '';
    if (/^(https?|about|data|file|blob):/i.test(u)) return true;
    Linking.openURL(u).catch(() => {});
    return false;
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

  // ---------- Écran onglets ----------
  if (view === 'tabs') {
    return (
      <TabsScreen
        theme={theme}
        tabs={tabs}
        activeTabId={activeId}
        onSelect={selectTab}
        onClose={closeTab}
        onNewTab={() => addTab(false)}
        onDone={() => setView('browser')}
        onCloseAll={closeAllTabs}
      />
    );
  }

  // ---------- Écrans Favoris / Historique ----------
  if (view === 'bookmarks' || view === 'history') {
    const isBook = view === 'bookmarks';
    return (
      <ListScreen
        theme={theme}
        title={isBook ? 'Favoris' : 'Historique'}
        icon={isBook ? 'star-outline' : 'time-outline'}
        items={isBook ? bookmarks : history}
        emptyText={isBook ? 'Aucun favori pour le moment' : 'Aucun historique'}
        onOpen={(url) => navigateTo(url)}
        onDelete={(item) =>
          isBook
            ? setBookmarks((p) => p.filter((b) => b.url !== item.url))
            : setHistory((p) => p.filter((h) => h.id !== item.id))
        }
        onClearAll={() => {
          Alert.alert(
            isBook ? 'Vider les favoris ?' : 'Effacer l’historique ?',
            'Cette action est irréversible.',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Confirmer', style: 'destructive', onPress: () => (isBook ? setBookmarks([]) : setHistory([])) },
            ]
          );
        }}
        onBack={() => setView('browser')}
      />
    );
  }

  // ---------- Écran navigateur ----------
  return (
    <View style={{ flex: 1, backgroundColor: theme.chromeBg }}>
      <View style={{ height: TOP_INSET, backgroundColor: theme.chromeBg }} />

      {/* Barre d'adresse (masquée sur la page d'accueil) */}
      {!onHome && (
        <View style={[styles.addressRow, { backgroundColor: theme.chromeBg }]}>
          <AddressBar
            theme={theme}
            url={activeTab.currentUrl}
            loading={activeTab.loading}
            onSubmit={(v) => navigateTo(v)}
            onReload={reload}
            onStop={stop}
          />
        </View>
      )}

      {!onHome && (
        <ProgressBar
          theme={theme}
          progress={activeTab.progress}
          visible={activeTab.loading && activeTab.progress < 1}
        />
      )}

      {/* Contenu : page d'accueil OU page web */}
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        {onHome ? (
          <HomeScreen
            theme={theme}
            incognito={activeTab.incognito}
            onOpen={(url) => navigateTo(url)}
            onSearch={(q) => navigateTo(q)}
          />
        ) : (
          <WebView
            key={activeTab.id}
            ref={(r) => { webviewRef.current = r; }}
            source={{ uri: activeTab.url }}
            originWhitelist={['*']}
            incognito={activeTab.incognito}
            onShouldStartLoadWithRequest={onShouldStart}
            onLoadProgress={({ nativeEvent }) => patchTab(activeTab.id, { progress: nativeEvent.progress })}
            onLoadStart={() => patchTab(activeTab.id, { loading: true })}
            onLoadEnd={() => patchTab(activeTab.id, { loading: false, progress: 1 })}
            onNavigationStateChange={(nav) => {
              patchTab(activeTab.id, {
                currentUrl: nav.url,
                title: nav.title,
                canGoBack: nav.canGoBack,
                canGoForward: nav.canGoForward,
              });
              if (!nav.loading) pushHistory(nav.url, nav.title, activeTab.incognito);
            }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled
            javaScriptEnabled
            startInLoadingState
          />
        )}
      </View>

      {/* Barre d'outils du bas */}
      <View style={{ paddingBottom: BOTTOM_INSET, backgroundColor: theme.toolbarBg }}>
        <Toolbar
          theme={theme}
          canGoBack={activeTab.canGoBack}
          canGoForward={activeTab.canGoForward}
          tabCount={tabs.length}
          onBack={goBack}
          onForward={goForward}
          onHome={goHome}
          onTabs={() => setView('tabs')}
          onMenu={() => setMenuOpen(true)}
        />
      </View>

      <Menu
        theme={theme}
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isBookmarked={isBookmarked}
        actions={menuActions}
      />
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Browser />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
