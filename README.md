# TikTok Video Generation System

Système de génération automatique de vidéos IA pour promotion TikTok/Telegram utilisant Kling v2.5 Turbo Pro via Replicate API.

## 🎯 Fonctionnalités

- **Profils de personnages IA réutilisables** : Créez et réutilisez des profils de personnages avec prompts et seeds pour une cohérence visuelle
- **Templates de texte promotionnel** : Gérez des templates de texte avec personnalisation (position, taille, couleur)
- **Génération vidéo automatique** : Génération de vidéos verticales TikTok (9:16) avec overlay de texte
- **Interface web complète** : Dashboard Next.js pour gérer profils, templates et vidéos générées

## 🛠️ Stack Technique

- **Backend** : Node.js/Express + TypeScript
- **Base de données** : SQLite (better-sqlite3)
- **Génération vidéo IA** : Replicate API avec modèle Kling v2.5 Turbo Pro
- **Traitement vidéo** : FFmpeg pour overlay texte et génération thumbnails
- **Frontend** : Next.js 14+ avec TypeScript, Tailwind CSS
- **Storage** : Fichiers locaux dans `/videos`

## 📋 Prérequis

- Node.js 18+ et npm
- FFmpeg installé sur votre système
  - **macOS** : `brew install ffmpeg`
  - **Linux** : `sudo apt-get install ffmpeg` ou `sudo yum install ffmpeg`
  - **Windows** : Télécharger depuis [ffmpeg.org](https://ffmpeg.org/download.html)
- Compte Replicate avec API token

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
# Installer les dépendances backend et frontend
npm run install:all
```

### 2. Configuration

Créer un fichier `.env` à la racine du projet (copier depuis `.env.example` si disponible) :

```env
# Backend
PORT=3001
NODE_ENV=development

# Replicate - Modèle Kling v2.5 Turbo Pro
REPLICATE_API_TOKEN=your_token_here
REPLICATE_MODEL=kwaivgi/kling-v2.5-turbo-pro

# Database (SQLite - chemin relatif)
DATABASE_PATH=./backend/data/tiktokgen.db

# Storage
VIDEOS_DIR=./videos

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Initialiser la base de données

```bash
cd backend
npm run migrate
```

### 4. Démarrer les serveurs

**Terminal 1 - Backend :**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend :**
```bash
npm run dev:frontend
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend API : http://localhost:3001

## 📖 Utilisation

### 1. Créer un profil de personnage

1. Aller sur `/character-profiles`
2. Cliquer sur "Create New Profile"
3. Remplir les informations :
   - **Name** : Nom du profil
   - **Character Prompt** : Description détaillée du personnage (max 500 caractères)
   - **Style** : dancing, sexy, casual, elegant, cute, sporty
   - **Seed** (optionnel) : Seed pour cohérence visuelle
   - **Telegram Username** (optionnel) : Username Telegram associé

**Exemple de prompt :**
```
A beautiful young woman with long dark hair, expressive eyes, wearing a casual outfit, standing in a modern room with natural lighting
```

### 2. Créer un template de texte

1. Aller sur `/text-templates`
2. Cliquer sur "Create New Template"
3. Configurer :
   - **Title** : Nom du template
   - **Text Content** : Texte à afficher sur la vidéo
   - **Position** : top, center, ou bottom
   - **Font Size** : Taille de police (12-72px)
   - **Font Color** : Couleur hexadécimale
   - **Telegram Username/Link** (optionnel)

### 3. Générer une vidéo

1. Aller sur `/videos/generate`
2. Sélectionner un profil de personnage et un template de texte
3. Configurer les options Kling (optionnel) :
   - **Duration** : 5 ou 10 secondes (défaut: 5s)
   - **Aspect Ratio** : 9:16 (TikTok), 16:9, ou 1:1 (défaut: 9:16)
   - **Guidance Scale** : 1-20 (défaut: 7.5) - Contrôle la fidélité au prompt
   - **Negative Prompt** (optionnel) : Éléments à éviter
4. Cliquer sur "Generate Video"

La génération prend généralement 30 secondes à 2 minutes selon la queue Replicate.

### 4. Télécharger les vidéos

1. Aller sur `/videos`
2. Filtrer par statut si nécessaire
3. Cliquer sur "Download" pour les vidéos complétées

## 🎨 Modèle Kling v2.5 Turbo Pro

### Avantages

- **Meilleure cohérence visuelle** : Moins d'artefacts et de variations entre frames
- **Fidélité au prompt** : Compréhension améliorée des prompts complexes
- **Format natif 9:16** : Support vertical TikTok sans resize
- **Qualité optimale** : Rendu cinématographique avec mouvements fluides

### Paramètres recommandés pour TikTok

- **aspect_ratio** : `"9:16"` (vertical TikTok)
- **duration** : `5` secondes (optimal pour clips courts)
- **guidance_scale** : `7.5` (bon équilibre qualité/fidélité)

### Limitations

- **Durée limitée** : Maximum 10 secondes par génération
- **Coût** : Vérifier les crédits Replicate selon votre volume d'usage
- **Audio** : v2.5 ne génère pas d'audio natif (ajouter séparément si besoin)

### Estimation de coût

Pour un usage personnel de **3-4 vidéos/jour** :
- Coût approximatif : ~$0.10-0.20 par vidéo selon durée et résolution
- Budget mensuel estimé : ~$10-25

Consultez [Replicate Pricing](https://replicate.com/pricing) pour les tarifs actuels.

## 📝 Exemples de prompts optimisés pour Kling

### Personnage féminin élégant
```
A beautiful elegant woman with long blonde hair, wearing a sophisticated dress, standing in a luxurious room with cinematic lighting, high quality, detailed features, 4K
```

### Personnage dansant
```
A young woman with short dark hair, wearing casual sportswear, dancing gracefully in a modern studio with bright lighting, smooth movements, rhythmic motion, high quality
```

### Personnage mignon
```
A cute young woman with curly hair, wearing a colorful casual outfit, smiling warmly in a cozy room with soft natural lighting, adorable expression, high quality
```

## 🔧 Structure du projet

```
tiktokgen/
├── backend/
│   ├── src/
│   │   ├── db/              # Migrations SQLite
│   │   ├── models/          # Modèles TypeScript avec validation Zod
│   │   ├── routes/          # Routes Express
│   │   ├── services/        # Services (database, replicate, ffmpeg, storage)
│   │   └── server.ts       # Point d'entrée Express
│   └── package.json
├── frontend/
│   ├── app/                 # Pages Next.js (App Router)
│   ├── lib/                 # Utilitaires et client API
│   └── package.json
├── videos/                  # Vidéos générées (créé automatiquement)
└── README.md
```

## 🐛 Troubleshooting

### FFmpeg non trouvé

**Erreur** : `FFmpeg not found`

**Solution** :
- Vérifier l'installation : `ffmpeg -version`
- Sur macOS avec Homebrew : `brew install ffmpeg`
- Sur Linux : Installer via package manager
- Sur Windows : Ajouter FFmpeg au PATH système

### Erreur Replicate API

**Erreur** : `REPLICATE_API_TOKEN environment variable is required`

**Solution** :
- Vérifier que le fichier `.env` existe et contient `REPLICATE_API_TOKEN`
- Obtenir un token sur [Replicate](https://replicate.com/account/api-tokens)

### Timeout de génération

**Erreur** : `Polling timeout after 5 minutes`

**Solution** :
- La queue Replicate peut être longue pendant les heures de pointe
- Réessayer plus tard ou vérifier le statut sur le dashboard Replicate
- Augmenter `MAX_POLL_TIME` dans `replicate-service.ts` si nécessaire

### Vidéo non générée / Qualité médiocre

**Solutions** :
- Vérifier que le prompt ne dépasse pas 500 caractères
- Ajuster `guidance_scale` (augmenter pour plus de fidélité, diminuer pour plus de créativité)
- Utiliser un `seed` fixe pour reproduire des résultats
- Ajouter des prompts négatifs pour éviter certains éléments

### Erreur de base de données

**Erreur** : `SQLITE_CANTOPEN` ou permissions

**Solution** :
- Vérifier que le dossier `backend/data` existe et est accessible en écriture
- Vérifier les permissions du fichier de base de données
- Exécuter `npm run migrate` pour créer les tables

## 📚 API Endpoints

### Character Profiles

- `POST /api/character-profiles` - Créer un profil
- `GET /api/character-profiles` - Lister tous les profils
- `GET /api/character-profiles/:id` - Détails d'un profil
- `PATCH /api/character-profiles/:id` - Modifier un profil
- `DELETE /api/character-profiles/:id` - Supprimer un profil

### Text Templates

- `POST /api/text-templates` - Créer un template
- `GET /api/text-templates` - Lister tous les templates
- `GET /api/text-templates/:id` - Détails d'un template
- `PATCH /api/text-templates/:id` - Modifier un template
- `DELETE /api/text-templates/:id` - Supprimer un template

### Video Generation

- `POST /api/generate` - Générer une vidéo
- `GET /api/generated-videos` - Lister les vidéos (filtre `?status=completed`)
- `GET /api/generated-videos/:id` - Détails d'une vidéo
- `GET /api/generated-videos/:id/download` - Télécharger une vidéo
- `DELETE /api/generated-videos/:id` - Supprimer une vidéo

## 🚧 Développement

### Scripts disponibles

```bash
# Backend
npm run dev:backend      # Démarrer en mode développement
npm run build:backend    # Compiler TypeScript
npm run start            # Démarrer en production

# Frontend
npm run dev:frontend     # Démarrer Next.js en développement
npm run build:frontend   # Build de production
npm run start            # Démarrer en production
```

### Tests

Pour tester la génération vidéo isolément :

```typescript
// Exemple dans backend/src/test.ts
import { getReplicateService } from './services/replicate-service';

const service = getReplicateService();
const jobId = await service.generateVideo(
  'A beautiful woman dancing',
  undefined,
  'dancing',
  { duration: 5, aspectRatio: '9:16' }
);
console.log('Job ID:', jobId);
```

## 📄 License

ISC

## 🤝 Contribution

Projet personnel - Usage privé recommandé.

## 📞 Support

Pour les problèmes avec :
- **Replicate API** : [Replicate Support](https://replicate.com/docs)
- **FFmpeg** : [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- **Next.js** : [Next.js Documentation](https://nextjs.org/docs)
