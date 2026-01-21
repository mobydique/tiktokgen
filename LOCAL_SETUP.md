# Guide de démarrage local

Guide simple pour démarrer le projet en local sur votre Mac.

## 📋 Prérequis

1. **Node.js 18+** : Vérifiez avec `node --version`
2. **FFmpeg** : Installez avec `brew install ffmpeg`
3. **Compte Replicate** : Obtenez votre API token sur https://replicate.com/account/api-tokens

## 🚀 Installation rapide

### 1. Installer les dépendances

```bash
# À la racine du projet
npm run install:all
```

Cela installe les dépendances du backend et du frontend.

### 2. Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Backend
PORT=3001
NODE_ENV=development

# Replicate - Modèle Kling v2.5 Turbo Pro
REPLICATE_API_TOKEN=votre_token_ici

# Database (SQLite - chemin relatif)
DATABASE_PATH=./backend/data/tiktokgen.db

# Storage
VIDEOS_DIR=./videos

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

⚠️ **Important** : Remplacez `votre_token_ici` par votre vrai token Replicate.

### 3. Initialiser la base de données

```bash
cd backend
npm run migrate
```

Cela crée les tables SQLite nécessaires.

### 4. Démarrer les serveurs

**Terminal 1 - Backend :**
```bash
npm run dev:backend
```

Le backend sera disponible sur http://localhost:3001

**Terminal 2 - Frontend :**
```bash
npm run dev:frontend
```

Le frontend sera disponible sur http://localhost:3000

## ✅ Vérification

1. Ouvrez http://localhost:3000 dans votre navigateur
2. Vous devriez voir le dashboard TikTok Video Generator
3. Testez en créant un profil de personnage et un template de texte

## 📁 Structure des fichiers

- **Base de données** : `backend/data/tiktokgen.db`
- **Vidéos générées** : `videos/{videoId}/video.mp4`
- **Thumbnails** : `videos/{videoId}/thumbnail.jpg`

## 🔧 Commandes utiles

```bash
# Backend en mode développement (avec hot reload)
cd backend && npm run dev

# Backend en production
cd backend && npm run build && npm start

# Frontend en mode développement
cd frontend && npm run dev

# Frontend en production
cd frontend && npm run build && npm start
```

## 🐛 Troubleshooting

### FFmpeg non trouvé

```bash
# Vérifier l'installation
ffmpeg -version

# Installer si nécessaire
brew install ffmpeg
```

### Erreur de port déjà utilisé

Si le port 3001 ou 3000 est déjà utilisé :

```bash
# Trouver le processus
lsof -i :3001

# Tuer le processus
kill -9 <PID>
```

Ou changez le port dans `.env` :
```env
PORT=3002
```

### Erreur de base de données

```bash
# Supprimer et recréer la base de données
rm backend/data/tiktokgen.db
cd backend && npm run migrate
```

### Erreur Replicate API

- Vérifiez que `REPLICATE_API_TOKEN` est correct dans `.env`
- Vérifiez que vous avez des crédits sur Replicate
- Consultez les logs du backend pour plus de détails

## 💡 Astuces

1. **Logs en temps réel** : Les logs du backend s'affichent dans le terminal où vous avez lancé `npm run dev:backend`

2. **Hot reload** : Le backend et le frontend se rechargent automatiquement lors des modifications

3. **Backup** : Faites régulièrement des copies de :
   - `backend/data/tiktokgen.db` (base de données)
   - `videos/` (dossier des vidéos)

4. **Performance** : Pour usage personnel, les performances locales sont excellentes. La génération vidéo prend généralement 30s-2min selon la queue Replicate.

## 🎯 Workflow typique

1. Créer un profil de personnage (`/character-profiles`)
2. Créer un template de texte (`/text-templates`)
3. Générer une vidéo (`/videos/generate`)
4. Télécharger la vidéo depuis `/videos`

C'est tout ! Profitez de votre générateur de vidéos TikTok local. 🚀
