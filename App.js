// VERSION DE TEST v2 — lance le VRAI navigateur mais capture toute erreur JS et l'affiche.
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import RealApp from './App.real';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null, info: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    this.setState({ err, info });
  }
  render() {
    if (this.state.err) {
      const e = this.state.err;
      const info = this.state.info;
      return (
        <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
          <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 64 }}>
            <Text style={{ color: '#ff6b6b', fontSize: 20, fontWeight: 'bold', marginBottom: 14 }}>
              ERREUR DETECTEE
            </Text>
            <Text style={{ color: '#ffe08f', fontSize: 15, marginBottom: 14, lineHeight: 21 }}>
              {String((e && (e.message || e.toString())) || e)}
            </Text>
            <Text style={{ color: '#9fe0a0', fontSize: 11, lineHeight: 16 }}>
              {String((e && e.stack) || 'pas de stack')}
            </Text>
            {info && info.componentStack ? (
              <Text style={{ color: '#89b4ff', fontSize: 11, lineHeight: 16, marginTop: 14 }}>
                {String(info.componentStack)}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <RealApp />
    </ErrorBoundary>
  );
}
