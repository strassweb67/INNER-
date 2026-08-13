// Thèmes SOMBRES uniquement (le blanc fatigue les yeux). Plusieurs couleurs au choix.
function mk(key, o) {
  const chrome = o.chrome;
  return {
    mode: 'dark',
    glassTint: 'dark',
    danger: '#ff5a52',
    key,
    bg: o.bg,
    chromeBg: chrome,
    toolbarBg: chrome,
    text: o.text || '#f2f3f7',
    subtext: o.subtext || '#8b90a0',
    border: o.border || 'rgba(255,255,255,0.1)',
    inputBg: o.inputBg || 'rgba(255,255,255,0.08)',
    accent: o.accent,
    onAccent: o.onAccent || '#ffffff',
    card: o.card || chrome,
    progressTrack: 'rgba(255,255,255,0.08)',
    glassOverlay: o.glassOverlay || 'rgba(18,20,28,0.5)',
    glassStrong: o.glassStrong || 'rgba(28,31,42,0.62)',
    glassBorder: o.glassBorder || 'rgba(255,255,255,0.14)',
    glassHairline: o.glassHairline || 'rgba(255,255,255,0.2)',
    gradient: o.gradient,
    gradientTabs: o.gradientTabs || o.gradient,
  };
}

export const themes = {
  bleuNuit: mk('bleuNuit', {
    bg: '#060a16', chrome: '#080d1e', accent: '#3b82f6',
    glassBorder: 'rgba(120,150,255,0.18)', glassHairline: 'rgba(160,190,255,0.22)',
    gradient: ['#0a1330', '#0e0f2e', '#0a0c22'], gradientTabs: ['#0a1226', '#0c1024'],
  }),
  noir: mk('noir', {
    bg: '#000000', chrome: '#0a0a0a', accent: '#e5e5ea', onAccent: '#0a0a0a',
    glassBorder: 'rgba(255,255,255,0.14)', glassHairline: 'rgba(255,255,255,0.2)',
    gradient: ['#141414', '#0a0a0a', '#000000'], gradientTabs: ['#0d0d0d', '#050505'],
  }),
  orangeSombre: mk('orangeSombre', {
    bg: '#0f0803', chrome: '#160c04', accent: '#ff7a1a', onAccent: '#1a0f00',
    text: '#fbeee2', subtext: '#b09a86', inputBg: 'rgba(255,180,120,0.08)',
    glassBorder: 'rgba(255,150,80,0.2)', glassHairline: 'rgba(255,170,100,0.24)',
    gradient: ['#1e0f03', '#2a1206', '#180a02'], gradientTabs: ['#160c04', '#0f0703'],
  }),
  violet: mk('violet', {
    bg: '#0b0616', chrome: '#100a20', accent: '#a855f7',
    glassBorder: 'rgba(190,130,255,0.22)', glassHairline: 'rgba(210,160,255,0.26)',
    gradient: ['#180f34', '#1e1040', '#120a26'], gradientTabs: ['#140b2a', '#0f0820'],
  }),
  emeraude: mk('emeraude', {
    bg: '#04100c', chrome: '#07150f', accent: '#10b981',
    glassBorder: 'rgba(60,220,160,0.2)', glassHairline: 'rgba(120,240,190,0.24)',
    gradient: ['#062018', '#08281e', '#041711'], gradientTabs: ['#07150f', '#040f0b'],
  }),
  rubis: mk('rubis', {
    bg: '#140406', chrome: '#1c070a', accent: '#f43f5e', onAccent: '#fff',
    text: '#fbeaec', subtext: '#b98a90',
    glassBorder: 'rgba(255,90,120,0.22)', glassHairline: 'rgba(255,130,150,0.26)',
    gradient: ['#2a0910', '#330b14', '#1c070a'], gradientTabs: ['#1c070a', '#120406'],
  }),
  cyan: mk('cyan', {
    bg: '#04121a', chrome: '#061a26', accent: '#06b6d4',
    glassBorder: 'rgba(50,210,240,0.22)', glassHairline: 'rgba(120,235,255,0.26)',
    gradient: ['#062634', '#08303f', '#04151d'], gradientTabs: ['#061a26', '#04121a'],
  }),
  rose: mk('rose', {
    bg: '#160410', chrome: '#1e0718', accent: '#ec4899',
    text: '#fce9f3', subtext: '#bd8aa5',
    glassBorder: 'rgba(255,120,190,0.22)', glassHairline: 'rgba(255,160,210,0.26)',
    gradient: ['#2c0a20', '#360c28', '#1e0718'], gradientTabs: ['#1e0718', '#140410'],
  }),
};

export const THEME_ORDER = ['bleuNuit', 'noir', 'orangeSombre', 'violet', 'emeraude', 'rubis', 'cyan', 'rose'];
export const THEME_LABELS = {
  bleuNuit: 'Bleu nuit', noir: 'Noir', orangeSombre: 'Orange sombre', violet: 'Violet',
  emeraude: 'Émeraude', rubis: 'Rubis', cyan: 'Cyan', rose: 'Rose',
};

export const darkTheme = themes.bleuNuit;
export const lightTheme = themes.bleuNuit;
