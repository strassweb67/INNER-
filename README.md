# 📱 Mon Navigateur

Un navigateur web **complet pour téléphone (iOS + Android)**, construit avec **React Native + Expo**.
Un seul code fonctionne sur les deux plateformes.

## ✨ Fonctionnalités

- 🌐 **Affichage des pages web** (moteur natif via WebView)
- 🔎 **Barre d'adresse intelligente** : tape une adresse *ou* une recherche → recherche Google automatique
- 🗂️ **Onglets multiples** avec aperçu en grille, changement et fermeture
- ⬅️➡️ **Précédent / Suivant / Recharger / Accueil**
- ⭐ **Favoris** (sauvegardés sur le téléphone)
- 🕓 **Historique** de navigation
- 📊 **Barre de progression** du chargement
- 🌙 **Mode sombre / clair** (automatique selon le système)
- 🔗 **Partage** de la page en cours
- 📩 Ouverture des liens externes (`mailto:`, `tel:`…) dans les bonnes apps

## 🚀 Comment lancer l'app sur ton téléphone

### 1. Installer les outils (une seule fois, sur ton ordinateur)

Il faut **Node.js** installé : https://nodejs.org

Ensuite, dans le dossier du projet :

```bash
npm install
```

> 💡 Si tu vois un avertissement de versions, exécute cette commande pour aligner
> les paquets natifs avec ta version d'Expo :
> ```bash
> npx expo install react-native-webview @react-native-async-storage/async-storage react-native-safe-area-context
> ```

### 2. Installer **Expo Go** sur ton téléphone

- **iPhone** : cherche « Expo Go » sur l'App Store
- **Android** : cherche « Expo Go » sur le Play Store

### 3. Démarrer le projet

```bash
npm start
```

Un **QR code** s'affiche dans le terminal.

- **iPhone** : ouvre l'app **Appareil photo**, vise le QR code, touche la notification
- **Android** : ouvre **Expo Go**, touche « Scan QR code », vise le QR code

L'app se lance sur ton téléphone ! Chaque modification du code se recharge automatiquement.

> ⚠️ Le téléphone et l'ordinateur doivent être sur le **même réseau Wi-Fi**.
> Sinon, lance `npx expo start --tunnel`.

## 📦 Créer une vraie app installable (.apk / App Store)

Quand tu es satisfait, tu peux générer une application autonome avec **EAS Build** :

```bash
npm install -g eas-cli
eas build --platform android   # fichier .apk / .aab
eas build --platform ios       # nécessite un compte Apple Developer
```

Documentation : https://docs.expo.dev/build/setup/

## 🗂️ Structure du projet

```
.
├── App.js                       # Application principale (onglets, WebView, logique)
├── app.json                     # Configuration Expo (nom, permissions…)
├── package.json                 # Dépendances
└── src/
    ├── theme.js                 # Couleurs (mode clair / sombre)
    ├── utils/
    │   ├── url.js               # URL vs recherche, formatage
    │   └── storage.js           # Sauvegarde locale (favoris, historique)
    └── components/
        ├── AddressBar.js        # Barre d'adresse
        ├── Toolbar.js           # Barre d'outils du bas
        ├── ProgressBar.js       # Barre de progression
        ├── Menu.js              # Menu des actions
        ├── TabsScreen.js        # Gestion des onglets
        └── ListScreen.js        # Écran Favoris / Historique
```

## 🛠️ Personnaliser

- **Page d'accueil / moteur de recherche** : modifie `src/utils/url.js` (`HOME_URL`, `SEARCH_ENGINE`)
- **Couleurs** : modifie `src/theme.js`
- **Nom de l'app** : modifie `name` dans `app.json`

Bonne navigation ! 🚀
