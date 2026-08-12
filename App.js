// Mon Navigateur — application complète iOS + Android (Expo / React Native)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Share,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { darkTheme, lightTheme } from './src/theme';
import { HOME_URL, toUrl, domainOf } from './src/utils/url';
import * as store from './src/utils/storage';

import ProgressBar from './src/components/ProgressBar';
import AddressBar from './src/components/AddressBar';
import Toolbar from './src/components/Toolbar';
import Menu from './src/components/Menu';
import TabsScreen from './src/components/TabsScreen';
import ListScreen from './src/components/ListScreen';

let _id = 0;
const makeId = () => `tab_${Date.now().toString(36)}_${_id++}`;

function newTab(url = HOME_URL) {
  return {
    id: makeId(),
    url, // adresse "commandée" (source de la WebView)
    currentUrl: url, // adresse réelle affichée
    title: '',
    loading: false,
    progress: 0,
    canGoBack: false,
    canGoForward: false,
  };
}

export default function App() {
  const scheme = useColorScheme();
  const [themePref, setThemePref] = useState('auto'); // 'auto' | 'light' | 'dark'
  const theme = useMemo(() => {
    const resolved = themePref === 'auto' ? scheme : themePref;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [themePref, scheme]);

  const [tabs, setTabs] = useState([newTab()]);
  const [activeId, setActiveId] = useState(() => tabs[0].id);
  const [view, setView] = useState('browser'); // browser | tabs | bookmarks | history
  const [menuOpen, setMenuOpen] = useState(false);

  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);

  const webviewRefs = useRef({});

  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];

  // ---- Chargement initial des données sauvegardées ----
  useEffect(() => {
    (async () => {
      const [b, h, s] = await Promise.all([
        store.loadBookmarks(),
        store.loadHistory(),
        store.loadSettings(),
      ]);
      setBookmarks(b);
      setHistory(h);
      if (s && s.theme) setThemePref(s.theme);
    })();
  }, []);

  // ---- Persistance ----
  useEffect(() => { store.saveBookmarks(bookmarks); }, [bookmarks]);
  useEffect(() => { store.saveHistory(history); }, [history]);

  const patchTab = useCallback((id, patch) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  // ---- Historique ----
  const pushHistory = useCallback((url, title) => {
    if (!url || /^about:/i.test(url)) return;
    setHistory((prev) => {
      if (prev[0] && prev[0].url === url) {
        const copy = [...prev];
        copy[0] = { ...copy[0], title: title || copy[0].title };
        return copy;
      }
      const entry = { id: makeId(), url, title: title || domainOf(url), time: Date.now() };
      return [entry, ...prev].slice(0, 500);
    });
  }, []);

  // ---- Navigation dans l'onglet actif ----
  const navigateTo = useCallback((input, id = activeId) => {
    const target = toUrl(input);
    patchTab(id, { url: target, currentUrl: target });
    setView('browser');
  }, [activeId, patchTab]);

  const goBack = () => webviewRefs.current[activeId]?.goBack();
  const goForward = () => webviewRefs.current[activeId]?.goForward();
  const reload = () => webviewRefs.current[activeId]?.reload();
  const stop = () => webviewRefs.current[activeId]?.stopLoading();
  const goHome = () => navigateTo(HOME_URL);

  // ---- Onglets ----
  const addTab = useCallback((url = HOME_URL) => {
    const t = newTab(url);
    setTabs((prev) => [...prev, t]);
    setActiveId(t.id);
    setView('browser');
  }, []);

  const selectTab = (id) => {
    setActiveId(id);
    setView('browser');
  };

  const closeTab = useCallback((id) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      delete webviewRefs.current[id];
      if (next.length === 0) {
        const fresh = newTab();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) {
        const neighbour = next[Math.max(0, idx - 1)];
        setActiveId(neighbour.id);
      }
      return next;
    });
  }, [activeId]);

  const closeAllTabs = () => {
    const fresh = newTab();
    webviewRefs.current = {};
    setTabs([fresh]);
    setActiveId(fresh.id);
    setView('browser');
  };

  // ---- Favoris ----
  const isBookmarked = bookmarks.some((b) => b.url === activeTab.currentUrl);

  const toggleBookmark = () => {
    const url = activeTab.currentUrl;
    if (!url) return;
    setBookmarks((prev) => {
      if (prev.some((b) => b.url === url)) return prev.filter((b) => b.url !== url);
      return [{ id: makeId(), url, title: activeTab.title || domainOf(url) }, ...prev];
    });
  };

  // ---- Thème ----
  const toggleTheme = () => {
    const next = theme.mode === 'dark' ? 'light' : 'dark';
    setThemePref(next);
    store.saveSettings({ theme: next });
  };

  // ---- Partage ----
  const sharePage = async () => {
    try {
      await Share.share({ message: activeTab.currentUrl, url: activeTab.currentUrl });
    } catch (e) {}
  };

  // ---- Gestion des liens externes (mailto:, tel:, etc.) ----
  const onShouldStart = (req) => {
    const u = req.url || '';
    if (/^(https?|about|data|file|blob):/i.test(u)) return true;
    Linking.openURL(u).catch(() => {});
    return false;
  };

  const menuActions = {
    newTab: () => { setMenuOpen(false); addTab(); },
    toggleBookmark: () => { setMenuOpen(false); toggleBookmark(); },
    openBookmarks: () => { setMenuOpen(false); setView('bookmarks'); },
    openHistory: () => { setMenuOpen(false); setView('history'); },
    share: () => { setMenuOpen(false); sharePage(); },
    reload: () => { setMenuOpen(false); reload(); },
    toggleTheme: () => { toggleTheme(); },
  };

  // ---- Écrans annexes ----
  if (view === 'tabs') {
    return (
      <SafeAreaProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <TabsScreen
          theme={theme}
          tabs={tabs}
          activeTabId={activeId}
          onSelect={selectTab}
          onClose={closeTab}
          onNewTab={() => addTab()}
          onDone={() => setView('browser')}
          onCloseAll={closeAllTabs}
        />
      </SafeAreaProvider>
    );
  }

  if (view === 'bookmarks' || view === 'history') {
    const isBook = view === 'bookmarks';
    return (
      <SafeAreaProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
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
                {
                  text: 'Confirmer',
                  style: 'destructive',
                  onPress: () => (isBook ? setBookmarks([]) : setHistory([])),
                },
              ]
            );
          }}
          onBack={() => setView('browser')}
        />
      </SafeAreaProvider>
    );
  }

  // ---- Écran navigateur ----
  return (
    <SafeAreaProvider>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.root, { backgroundColor: theme.chromeBg }]} edges={['top']}>
        {/* Zone des pages web (toutes les WebView empilées, seule l'active est visible) */}
        <View style={[styles.webArea, { backgroundColor: theme.bg }]}>
          {tabs.map((tab) => {
            const active = tab.id === activeId;
            return (
              <View
                key={tab.id}
                style={[StyleSheet.absoluteFill, { display: active ? 'flex' : 'none' }]}
              >
                <WebView
                  ref={(r) => { webviewRefs.current[tab.id] = r; }}
                  source={{ uri: tab.url }}
                  originWhitelist={['*']}
                  onShouldStartLoadWithRequest={onShouldStart}
                  onLoadProgress={({ nativeEvent }) =>
                    patchTab(tab.id, { progress: nativeEvent.progress })
                  }
                  onLoadStart={() => patchTab(tab.id, { loading: true })}
                  onLoadEnd={() => patchTab(tab.id, { loading: false, progress: 1 })}
                  onNavigationStateChange={(nav) => {
                    patchTab(tab.id, {
                      currentUrl: nav.url,
                      title: nav.title,
                      canGoBack: nav.canGoBack,
                      canGoForward: nav.canGoForward,
                    });
                    if (!nav.loading) pushHistory(nav.url, nav.title);
                  }}
                  allowsBackForwardNavigationGestures
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  pullToRefreshEnabled
                  domStorageEnabled
                  javaScriptEnabled
                  startInLoadingState
                  decelerationRate="normal"
                />
              </View>
            );
          })}
        </View>

        {/* Barre de progression */}
        <ProgressBar
          theme={theme}
          progress={activeTab.progress}
          visible={activeTab.loading && activeTab.progress < 1}
        />

        {/* Barre d'adresse */}
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

        {/* Barre d'outils */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.toolbarBg }}>
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
        </SafeAreaView>
      </SafeAreaView>

      {/* Menu */}
      <Menu
        theme={theme}
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isBookmarked={isBookmarked}
        actions={menuActions}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webArea: { flex: 1, position: 'relative' },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
