// Page "Mémoire Pro" plein écran : liste des mémos + recherche + détail + éditeur.
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Glass from './Glass';

const TOP = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 47;

export const MEMO_TYPES = {
  text: { label: 'Texte', icon: 'document-text-outline', color: '#8b5cf6' },
  code: { label: 'Code', icon: 'code-slash-outline', color: '#22d3ee' },
  idea: { label: 'Idée', icon: 'bulb-outline', color: '#f5c518' },
  doc: { label: 'Doc', icon: 'document-outline', color: '#34d399' },
  image: { label: 'Image', icon: 'image-outline', color: '#f472b6' },
  link: { label: 'Lien', icon: 'link-outline', color: '#3b82f6' },
};
const CATS = [
  { key: 'all', label: 'Tout' },
  { key: 'text', label: 'Textes' },
  { key: 'code', label: 'Codes' },
  { key: 'idea', label: 'Idées' },
  { key: 'doc', label: 'Docs' },
  { key: 'image', label: 'Images' },
];

function timeLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts); const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Hier';
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

let _mid = 0;
const memoId = () => `m_${Date.now().toString(36)}_${_mid++}`;

export default function MemosScreen({ theme, memos, onBack, onSave, onDelete, onToggleStar, initialMemoId, bottomInset = 0 }) {
  const [query, setQuery] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [mode, setMode] = React.useState('list'); // list | detail | edit
  const [current, setCurrent] = React.useState(null);

  React.useEffect(() => {
    if (initialMemoId) {
      const m = memos.find((x) => x.id === initialMemoId);
      if (m) { setCurrent(m); setMode('detail'); }
    }
  }, [initialMemoId]);

  const counts = React.useMemo(() => {
    const c = { all: memos.length };
    memos.forEach((m) => { c[m.type] = (c[m.type] || 0) + 1; });
    return c;
  }, [memos]);

  const filtered = memos.filter((m) => {
    if (cat !== 'all' && m.type !== cat) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.title || '').toLowerCase().includes(q) ||
      (m.body || '').toLowerCase().includes(q) ||
      (m.tags || []).join(' ').toLowerCase().includes(q)
    );
  });

  // ---------- Éditeur ----------
  if (mode === 'edit') {
    return <MemoEditor theme={theme} memo={current} onCancel={() => setMode(current ? 'detail' : 'list')}
      onSave={(m) => { onSave(m); setCurrent(m); setMode('detail'); }} bottomInset={bottomInset} />;
  }

  // ---------- Détail ----------
  if (mode === 'detail' && current) {
    const t = MEMO_TYPES[current.type] || MEMO_TYPES.text;
    const fresh = memos.find((x) => x.id === current.id) || current;
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} />
        <View style={{ paddingTop: TOP, flex: 1 }}>
          <View style={styles.header}>
            <Pressable onPress={() => setMode('list')} hitSlop={10}><Ionicons name="chevron-back" size={26} color={theme.text} /></Pressable>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <Pressable onPress={() => onToggleStar(fresh.id)} hitSlop={8}><Ionicons name={fresh.starred ? 'star' : 'star-outline'} size={22} color={fresh.starred ? '#f5c518' : theme.text} /></Pressable>
              <Pressable onPress={() => Share.share({ message: `${fresh.title}\n\n${fresh.body}` }).catch(() => {})} hitSlop={8}><Ionicons name="share-social-outline" size={22} color={theme.text} /></Pressable>
              <Pressable onPress={() => { setCurrent(fresh); setMode('edit'); }} hitSlop={8}><Ionicons name="create-outline" size={22} color={theme.text} /></Pressable>
              <Pressable onPress={() => { onDelete(fresh.id); setMode('list'); }} hitSlop={8}><Ionicons name="trash-outline" size={22} color={theme.danger} /></Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 + bottomInset }}>
            <View style={[styles.typeBadge, { borderColor: t.color }]}>
              <Ionicons name={t.icon} size={15} color={t.color} />
              <Text style={{ color: t.color, fontSize: 12, fontWeight: '700' }}>{t.label}</Text>
            </View>
            <Text style={[styles.detailTitle, { color: theme.text }]}>{fresh.title}</Text>
            <Text style={{ color: theme.subtext, fontSize: 12, marginBottom: 16 }}>{timeLabel(fresh.time)}</Text>
            <View style={[styles.body, { backgroundColor: theme.inputBg }]}>
              <Text style={{ color: theme.text, fontSize: 15, lineHeight: 22, fontFamily: fresh.type === 'code' ? (Platform.OS === 'ios' ? 'Menlo' : 'monospace') : undefined }}>{fresh.body}</Text>
            </View>
            {(fresh.tags || []).length ? (
              <View style={styles.tags}>
                {fresh.tags.map((tg) => (<View key={tg} style={[styles.tag, { backgroundColor: theme.inputBg }]}><Text style={{ color: theme.accent, fontSize: 12 }}>{tg}</Text></View>))}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    );
  }

  // ---------- Liste ----------
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: TOP, flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="chevron-back" size={26} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Mémoire Pro</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Recherche */}
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          <Glass theme={theme} style={styles.search} intensity={55} hairline>
            <Ionicons name="search" size={18} color={theme.subtext} />
            <TextInput style={{ flex: 1, color: theme.text, fontSize: 15, padding: 0 }} value={query} onChangeText={setQuery}
              placeholder="Rechercher un mot dans les mémos…" placeholderTextColor={theme.subtext} autoCapitalize="none" autoCorrect={false} />
            {query ? <Pressable onPress={() => setQuery('')} hitSlop={10}><Ionicons name="close-circle" size={18} color={theme.subtext} /></Pressable> : null}
          </Glass>
        </View>

        {/* Catégories */}
        <View style={{ height: 52 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
            {CATS.map((c) => {
              const active = cat === c.key;
              return (
                <Pressable key={c.key} onPress={() => setCat(c.key)} style={[styles.catChip, { backgroundColor: active ? theme.accent : theme.inputBg, borderColor: active ? theme.accent : theme.border }]}>
                  <Text style={{ color: active ? theme.onAccent : theme.text, fontSize: 13, fontWeight: '600' }}>{c.label} {counts[c.key] || 0}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 + bottomInset }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="sparkles-outline" size={44} color={theme.border} />
              <Text style={{ color: theme.subtext, marginTop: 12 }}>{query ? 'Aucun mémo trouvé' : 'Aucun mémo. Touche + pour en créer un.'}</Text>
            </View>
          ) : filtered.map((m) => {
            const t = MEMO_TYPES[m.type] || MEMO_TYPES.text;
            return (
              <Pressable key={m.id} onPress={() => { setCurrent(m); setMode('detail'); }} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Glass theme={theme} style={styles.memoRow} intensity={40} hairline>
                  <View style={[styles.memoIcon, { borderColor: t.color }]}><Ionicons name={t.icon} size={18} color={t.color} /></View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>{m.title}</Text>
                    <Text numberOfLines={1} style={{ color: theme.subtext, fontSize: 12.5, marginTop: 2 }}>{m.body}</Text>
                    {(m.tags || []).length ? (
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                        {m.tags.slice(0, 3).map((tg) => (<View key={tg} style={[styles.tagSm, { backgroundColor: theme.inputBg }]}><Text style={{ color: theme.accent, fontSize: 11 }}>{tg}</Text></View>))}
                      </View>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={{ color: theme.subtext, fontSize: 11 }}>{timeLabel(m.time)}</Text>
                    <Pressable onPress={() => onToggleStar(m.id)} hitSlop={10}><Ionicons name={m.starred ? 'star' : 'star-outline'} size={18} color={m.starred ? '#f5c518' : theme.subtext} /></Pressable>
                  </View>
                </Glass>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* FAB nouveau mémo */}
        <Pressable onPress={() => { setCurrent(null); setMode('edit'); }} style={[styles.fab, { backgroundColor: theme.accent, bottom: 22 + bottomInset }]}>
          <Ionicons name="add" size={30} color={theme.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

function MemoEditor({ theme, memo, onCancel, onSave, bottomInset }) {
  const [title, setTitle] = React.useState(memo ? memo.title : '');
  const [body, setBody] = React.useState(memo ? memo.body : '');
  const [type, setType] = React.useState(memo ? memo.type : 'text');
  const [tags, setTags] = React.useState(memo ? (memo.tags || []).join(', ') : '');

  const save = () => {
    const m = {
      id: memo ? memo.id : memoId(),
      type, title: title.trim() || 'Sans titre', body: body.trim(),
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      time: Date.now(), starred: memo ? !!memo.starred : false,
    };
    onSave(m);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: TOP, flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={10}><Text style={{ color: theme.subtext, fontSize: 16 }}>Annuler</Text></Pressable>
          <Text style={[styles.title, { color: theme.text }]}>{memo ? 'Modifier' : 'Nouveau mémo'}</Text>
          <Pressable onPress={save} hitSlop={10}><Text style={{ color: theme.accent, fontSize: 16, fontWeight: '700' }}>OK</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 + bottomInset }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
            {Object.keys(MEMO_TYPES).map((k) => {
              const t = MEMO_TYPES[k]; const active = type === k;
              return (
                <Pressable key={k} onPress={() => setType(k)} style={[styles.typeChip, { borderColor: active ? t.color : theme.border, backgroundColor: active ? theme.inputBg : 'transparent' }]}>
                  <Ionicons name={t.icon} size={15} color={t.color} />
                  <Text style={{ color: theme.text, fontSize: 13 }}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <TextInput value={title} onChangeText={setTitle} placeholder="Titre" placeholderTextColor={theme.subtext}
            style={[styles.editTitle, { color: theme.text, backgroundColor: theme.inputBg }]} />
          <TextInput value={body} onChangeText={setBody} placeholder="Contenu du mémo…" placeholderTextColor={theme.subtext} multiline
            style={[styles.editBody, { color: theme.text, backgroundColor: theme.inputBg, fontFamily: type === 'code' ? (Platform.OS === 'ios' ? 'Menlo' : 'monospace') : undefined }]} />
          <TextInput value={tags} onChangeText={setTags} placeholder="Tags (séparés par des virgules)" placeholderTextColor={theme.subtext}
            autoCapitalize="none" style={[styles.editTitle, { color: theme.text, backgroundColor: theme.inputBg, marginTop: 12 }]} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 19, fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 14, height: 46 },
  catChip: { height: 36, paddingHorizontal: 16, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  memoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 12, marginBottom: 10 },
  memoIcon: { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  tagSm: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  fab: { position: 'absolute', right: 20, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12 },
  detailTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  body: { borderRadius: 14, padding: 16, marginBottom: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  editTitle: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, fontWeight: '600' },
  editBody: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, minHeight: 180, marginTop: 12, textAlignVertical: 'top' },
});
