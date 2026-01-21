# Guide de déploiement sur Vercel

## ⚠️ Limitations importantes

**Le projet actuel utilise SQLite et le stockage de fichiers locaux, ce qui ne fonctionne pas directement sur Vercel** car Vercel utilise des serverless functions sans système de fichiers persistant.

## 🔧 Adaptations nécessaires pour Vercel

### Option 1 : Utiliser Supabase (recommandé)

1. **Base de données** : Migrer de SQLite vers Supabase PostgreSQL
2. **Storage** : Utiliser Supabase Storage ou Cloudflare R2 pour les vidéos

### Option 2 : Architecture hybride

- **Frontend** : Déployer sur Vercel
- **Backend** : Déployer sur Railway, Render, ou un autre service qui supporte les fichiers persistants

## 📋 Déploiement Frontend uniquement sur Vercel

Si vous voulez déployer uniquement le frontend sur Vercel :

1. **Créer un projet Vercel** :
   ```bash
   cd frontend
   vercel
   ```

2. **Configurer les variables d'environnement** dans le dashboard Vercel :
   - `NEXT_PUBLIC_API_URL` : URL de votre backend (ex: https://your-backend.railway.app)

3. **Le backend doit être déployé ailleurs** (Railway, Render, etc.)

## 🚀 Déploiement complet (Frontend + Backend adapté)

Pour déployer sur Vercel avec une architecture serverless :

### 1. Migrer vers Supabase

- Créer un projet Supabase
- Exécuter les migrations SQL dans Supabase
- Modifier `database.ts` pour utiliser `@supabase/supabase-js`

### 2. Utiliser un storage cloud

- Cloudflare R2, AWS S3, ou Supabase Storage
- Modifier `storage-service.ts` pour utiliser le SDK du provider

### 3. Déployer sur Vercel

```bash
vercel
```

## 📝 Variables d'environnement Vercel

Configurer dans le dashboard Vercel :

```
REPLICATE_API_TOKEN=your_token
REPLICATE_MODEL=kwaivgi/kling-v2.5-turbo-pro
DATABASE_URL=your_supabase_url (si migration)
SUPABASE_SERVICE_ROLE_KEY=your_key (si migration)
R2_ENDPOINT=your_r2_endpoint (si R2)
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

## 🔗 Repo GitHub

Le code est disponible sur : https://github.com/mobydique/tiktokgen
