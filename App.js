// VERSION DE TEST (diagnostic) — n'utilise que les composants de base de React Native
// pour l'affichage principal, et teste les modules natifs à la demande via des boutons.
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

function check(label, fn) {
  try {
    return { label, ok: true, info: String(fn()) };
  } catch (e) {
    return { label, ok: false, info: String((e && (e.message || e.toString())) || e) };
  }
}

const results = [
  check('react-native-webview', () => 'WebView=' + typeof require('react-native-webview').WebView),
  check('async-storage', () => 'default=' + typeof require('@react-native-async-storage/async-storage').default),
  check('safe-area-context', () => 'Provider=' + typeof require('react-native-safe-area-context').SafeAreaProvider),
  check('vector-icons', () => 'Ionicons=' + typeof require('@expo/vector-icons').Ionicons),
  check('expo-font', () => 'loadAsync=' + typeof require('expo-font').loadAsync),
  check('expo-status-bar', () => 'StatusBar=' + typeof require('expo-status-bar').StatusBar),
];

function Btn({ label, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: color, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, marginBottom: 12 }}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [rt, setRt] = React.useState(null);
  const [showWeb, setShowWeb] = React.useState(false);
  const [showIcon, setShowIcon] = React.useState(false);

  React.useEffect(() => {
    try {
      const g = global.ErrorUtils;
      if (g && g.setGlobalHandler) {
        g.setGlobalHandler((e) => setRt(String((e && (e.stack || e.message)) || e)));
      }
    } catch (e) {}
  }, []);

  let WebView = null;
  let Ionicons = null;
  try { WebView = require('react-native-webview').WebView; } catch (e) {}
  try { Ionicons = require('@expo/vector-icons').Ionicons; } catch (e) {}

  const allOk = results.every((r) => r.ok);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 64 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>DIAGNOSTIC</Text>
        <Text style={{ color: allOk ? '#6ee36e' : '#ff6b6b', fontSize: 15, marginBottom: 18 }}>
          {allOk ? 'Modules charges OK' : 'Un module a un probleme'}
        </Text>

        {results.map((r, i) => (
          <Text key={i} style={{ color: r.ok ? '#8fe08f' : '#ff6b6b', fontSize: 13, marginBottom: 10, lineHeight: 19 }}>
            {(r.ok ? '[OK]  ' : '[ERR] ') + r.label}{'\n      '}{r.info}
          </Text>
        ))}

        <View style={{ height: 18 }} />
        <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 12 }}>
          Appuie sur chaque bouton. Si l'app SE FERME quand tu appuies, c'est CE composant le coupable :
        </Text>

        <Btn label="1) Tester les ICONES" color="#8a5cf6" onPress={() => setShowIcon(true)} />
        {showIcon && Ionicons ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 }}>
            <Ionicons name="globe-outline" size={28} color="#6ee36e" />
            <Ionicons name="star" size={28} color="#6ee36e" />
            <Text style={{ color: '#6ee36e', fontSize: 15 }}>Icones OK !</Text>
          </View>
        ) : null}

        <Btn label="2) Tester le WEBVIEW" color="#0a84ff" onPress={() => setShowWeb(true)} />
        {showWeb && WebView ? (
          <View style={{ height: 260, borderRadius: 10, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#333' }}>
            <WebView source={{ uri: 'https://example.com' }} />
          </View>
        ) : null}

        {rt ? (
          <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 14 }}>
            <Text style={{ color: '#ff6b6b', fontSize: 12, lineHeight: 18 }}>ERREUR RUNTIME:{'\n'}{rt}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
