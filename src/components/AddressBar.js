// Barre d'adresse : saisie d'URL / recherche, indicateur sécurisé, rechargement.
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { prettyUrl } from '../utils/url';

export default function AddressBar({
  theme,
  url,
  loading,
  onSubmit,
  onReload,
  onStop,
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setValue(url || '');
  }, [url, editing]);

  const isSecure = /^https:\/\//i.test(url || '');

  const beginEdit = () => {
    setValue(url || '');
    setEditing(true);
    // sélectionne tout pour remplacer facilement
    requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
  };

  const submit = () => {
    setEditing(false);
    inputRef.current && inputRef.current.blur();
    if (value.trim()) onSubmit(value);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.inputBg }]}>
      {editing ? (
        <Ionicons name="search" size={16} color={theme.subtext} style={styles.lead} />
      ) : (
        <Ionicons
          name={isSecure ? 'lock-closed' : 'earth'}
          size={15}
          color={isSecure ? theme.subtext : theme.subtext}
          style={styles.lead}
        />
      )}

      <TextInput
        ref={inputRef}
        style={[styles.input, { color: theme.text }]}
        value={editing ? value : prettyUrl(url)}
        onChangeText={setValue}
        onFocus={beginEdit}
        onSubmitEditing={submit}
        onBlur={() => setEditing(false)}
        placeholder="Rechercher ou saisir une adresse"
        placeholderTextColor={theme.subtext}
        selectTextOnFocus
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="go"
        numberOfLines={1}
      />

      {loading ? (
        <Pressable onPress={onStop} hitSlop={10} style={styles.trail}>
          <ActivityIndicator size="small" color={theme.subtext} />
        </Pressable>
      ) : (
        <Pressable onPress={onReload} hitSlop={10} style={styles.trail}>
          <Ionicons name="reload" size={17} color={theme.subtext} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  lead: { marginRight: 7 },
  trail: { marginLeft: 7, width: 20, alignItems: 'center' },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});
