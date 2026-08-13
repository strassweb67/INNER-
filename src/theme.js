// 3 thèmes SOMBRES uniquement (le blanc fatigue les yeux).
// Bleu nuit / Noir / Orange sombre. On défile de l'un à l'autre.

const base = {
  mode: 'dark',
  glassTint: 'dark',
  danger: '#ff5a52',
};

export const themes = {
  bleuNuit: {
    ...base,
    key: 'bleuNuit',
    bg: '#060a16',
    chromeBg: '#080d1e',
    toolbarBg: '#080d1e',
    text: '#eef2fb',
    subtext: '#8b93a7',
    border: '#1e2740',
    inputBg: 'rgba(255,255,255,0.07)',
    accent: '#3b82f6',
    onAccent: '#ffffff',
    card: '#0c1226',
    progressTrack: 'rgba(255,255,255,0.08)',
    glassOverlay: 'rgba(12,18,38,0.5)',
    glassStrong: 'rgba(18,26,52,0.62)',
    glassBorder: 'rgba(120,150,255,0.18)',
    glassHairline: 'rgba(160,190,255,0.22)',
    gradient: ['#0a1330', '#0e0f2e', '#0a0c22'],
    gradientTabs: ['#0a1226', '#0c1024'],
  },
  noir: {
    ...base,
    key: 'noir',
    bg: '#000000',
    chromeBg: '#080808',
    toolbarBg: '#080808',
    text: '#f2f2f4',
    subtext: '#8a8a90',
    border: '#1f1f22',
    inputBg: 'rgba(255,255,255,0.07)',
    accent: '#e5e5ea',
    onAccent: '#0a0a0a',
    card: '#101012',
    progressTrack: 'rgba(255,255,255,0.08)',
    glassOverlay: 'rgba(16,16,18,0.5)',
    glassStrong: 'rgba(26,26,28,0.62)',
    glassBorder: 'rgba(255,255,255,0.14)',
    glassHairline: 'rgba(255,255,255,0.2)',
    gradient: ['#141414', '#0a0a0a', '#000000'],
    gradientTabs: ['#0d0d0d', '#050505'],
  },
  orangeSombre: {
    ...base,
    key: 'orangeSombre',
    bg: '#0f0803',
    chromeBg: '#160c04',
    toolbarBg: '#160c04',
    text: '#fbeee2',
    subtext: '#b09a86',
    border: '#3a2410',
    inputBg: 'rgba(255,180,120,0.08)',
    accent: '#ff7a1a',
    onAccent: '#1a0f00',
    card: '#1a0f05',
    progressTrack: 'rgba(255,150,80,0.12)',
    glassOverlay: 'rgba(32,18,8,0.52)',
    glassStrong: 'rgba(44,26,12,0.62)',
    glassBorder: 'rgba(255,150,80,0.2)',
    glassHairline: 'rgba(255,170,100,0.24)',
    gradient: ['#1e0f03', '#2a1206', '#180a02'],
    gradientTabs: ['#160c04', '#0f0703'],
  },
};

export const THEME_ORDER = ['bleuNuit', 'noir', 'orangeSombre'];
export const THEME_LABELS = { bleuNuit: 'Bleu nuit', noir: 'Noir', orangeSombre: 'Orange sombre' };

// Rétro-compat (au cas où) :
export const darkTheme = themes.bleuNuit;
export const lightTheme = themes.bleuNuit;
