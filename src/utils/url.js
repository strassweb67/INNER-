// Décide si le texte tapé est une URL ou une recherche, et renvoie une URL valide.

const SEARCH_ENGINE = 'https://www.google.com/search?q=';

// Domaines de premier niveau les plus courants pour détecter une URL sans http
const COMMON_TLD = /\.(com|net|org|io|dev|app|co|fr|be|ch|ca|uk|us|de|es|it|eu|info|me|tv|gg|ai|xyz|gouv|gov|edu)(\/|$|\?|#|:)/i;

export function isProbablyUrl(text) {
  const t = text.trim();
  if (!t) return false;
  if (/\s/.test(t)) return false; // un espace => recherche
  if (/^(https?|about|file|data):/i.test(t)) return true;
  if (t === 'localhost' || t.startsWith('localhost:')) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?/.test(t)) return true; // adresse IP
  if (COMMON_TLD.test(t)) return true;
  // "quelquechose.quelquechose" sans espace => on tente une URL
  if (/^[^\s.]+\.[^\s.]{2,}/.test(t)) return true;
  return false;
}

// Transforme une saisie en URL prête à charger
export function toUrl(input) {
  const t = input.trim();
  if (!t) return SEARCH_ENGINE;
  if (isProbablyUrl(t)) {
    if (/^[a-z]+:\/\//i.test(t) || /^(about|data):/i.test(t)) return t;
    return 'https://' + t;
  }
  return SEARCH_ENGINE + encodeURIComponent(t);
}

// Affichage court d'une URL dans la barre (sans https://, sans / final)
export function prettyUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    let host = u.hostname.replace(/^www\./, '');
    if (u.pathname && u.pathname !== '/') host += u.pathname;
    return host;
  } catch (e) {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

// Récupère juste le nom de domaine (pour les titres par défaut)
export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
}

export const HOME_URL = 'https://www.google.com';
export { SEARCH_ENGINE };
