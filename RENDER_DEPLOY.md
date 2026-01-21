# Guide de déploiement sur Render

## 🚀 Architecture

- **Frontend** : Next.js sur Vercel
- **Backend** : Express + TypeScript sur Render
- **Database** : SQLite (sur Persistent Disk Render)
- **Storage** : Fichiers locaux (sur Persistent Disk Render)
- **FFmpeg** : Installé via build command

## 📋 Prérequis

1. Compte Render : https://render.com
2. Compte Vercel : https://vercel.com
3. Repo GitHub : https://github.com/mobydique/tiktokgen

## 🔧 Déploiement Backend sur Render

### Étape 1 : Créer le Web Service

1. Connectez-vous à Render Dashboard
2. Cliquez sur **"New"** → **"Web Service"**
3. Connectez votre repo GitHub : `mobydique/tiktokgen`
4. Sélectionnez le repo et cliquez sur **"Connect"**

### Étape 2 : Configuration du service

**Informations de base :**
- **Name** : `tiktokgen-backend`
- **Environment** : `Node`
- **Region** : Choisissez la région la plus proche (ex: Frankfurt, Oregon)
- **Branch** : `master` (ou votre branche principale)
- **Root Directory** : (laissez vide)

**Build & Deploy :**
- **Build Command** :
  ```bash
  apt-get update && apt-get install -y ffmpeg && cd backend && npm install && npm run build
  ```
- **Start Command** :
  ```bash
  cd backend && npm start
  ```

**Plan :**
- Sélectionnez **Free** (750 heures/mois gratuites)

### Étape 3 : Variables d'environnement

Ajoutez ces variables dans **"Environment"** :

```
NODE_ENV=production
PORT=10000
REPLICATE_API_TOKEN=votre_token_replicate_ici
REPLICATE_MODEL=kwaivgi/kling-v2.5-turbo-pro
DATABASE_PATH=/opt/render/project/src/backend/data/tiktokgen.db
VIDEOS_DIR=/opt/render/project/src/videos
```

**Important** : Remplacez `votre_token_replicate_ici` par votre vrai token Replicate.

### Étape 4 : Persistent Disk (CRUCIAL)

1. Dans les paramètres du service, allez dans **"Disks"**
2. Cliquez sur **"Add Disk"**
3. Configuration :
   - **Name** : `tiktokgen-storage`
   - **Mount Path** : `/opt/render/project/src`
   - **Size** : `10 GB` (gratuit jusqu'à 10GB)

⚠️ **Sans ce disk, SQLite et les vidéos seront perdus à chaque redéploiement !**

### Étape 5 : Déployer

1. Cliquez sur **"Create Web Service"**
2. Render va :
   - Installer FFmpeg
   - Installer les dépendances Node.js
   - Builder le projet TypeScript
   - Exécuter les migrations SQLite
   - Démarrer le serveur

3. Attendez la fin du déploiement (2-5 minutes)
4. Notez l'URL du service : `https://tiktokgen-backend.onrender.com` (ou similaire)

## 🌐 Déploiement Frontend sur Vercel

### Étape 1 : Créer le projet Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Add New Project"**
3. Importez le repo `mobydique/tiktokgen`

### Étape 2 : Configuration

**Framework Preset :**
- Next.js (détecté automatiquement)

**Root Directory :**
- `frontend`

**Build Command :**
- `npm run build` (par défaut)

**Output Directory :**
- `.next` (par défaut)

**Install Command :**
- `npm install` (par défaut)

### Étape 3 : Variables d'environnement

Ajoutez cette variable :

```
NEXT_PUBLIC_API_URL=https://tiktokgen-backend.onrender.com
```

⚠️ **Remplacez par l'URL réelle de votre backend Render !**

### Étape 4 : Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va builder et déployer le frontend
3. Votre app sera disponible sur `https://votre-app.vercel.app`

## ✅ Vérification

1. **Backend** : Visitez `https://votre-backend.onrender.com/health`
   - Devrait retourner : `{"status":"ok","timestamp":"..."}`

2. **Frontend** : Visitez votre URL Vercel
   - Le dashboard devrait se charger
   - Les appels API devraient fonctionner

## 🔍 Troubleshooting

### Erreur : FFmpeg not found

**Solution** : Vérifiez que le build command inclut bien l'installation de FFmpeg :
```bash
apt-get update && apt-get install -y ffmpeg && cd backend && npm install && npm run build
```

### Erreur : Database not found

**Solution** : 
- Vérifiez que le Persistent Disk est bien monté
- Vérifiez que `DATABASE_PATH` pointe vers le disk : `/opt/render/project/src/backend/data/tiktokgen.db`
- Vérifiez que les migrations s'exécutent (regardez les logs de build)

### Erreur : CORS

**Solution** : Le backend autorise déjà toutes les origines avec `cors()`. Si problème, vérifiez que `NEXT_PUBLIC_API_URL` est correct.

### Erreur : Timeout

**Solution** : Render Free tier peut avoir des timeouts. Pour usage personnel, c'est généralement suffisant. Si besoin, upgrade vers Starter ($7/mois).

### Vidéos perdues après redéploiement

**Solution** : Assurez-vous que le Persistent Disk est bien configuré et que `VIDEOS_DIR` pointe vers le disk monté.

## 📊 Monitoring

- **Logs Render** : Dashboard Render → Service → Logs
- **Logs Vercel** : Dashboard Vercel → Project → Deployments → Logs

## 💰 Coûts

- **Render Free** : 750h/mois (suffisant pour usage personnel)
- **Vercel Hobby** : Gratuit
- **Persistent Disk** : Gratuit jusqu'à 10GB
- **Total** : **Gratuit** pour usage personnel ! 🎉

## 🔄 Mises à jour

Pour mettre à jour le code :
1. Push sur GitHub
2. Render et Vercel redéploient automatiquement
3. Les données sur le Persistent Disk sont conservées

## 📝 Notes importantes

1. **Sleep sur Free tier** : Render met les services gratuits en veille après 15 min d'inactivité. Le premier appel peut prendre 30-60s pour "réveiller" le service.

2. **Persistent Disk** : Les données sont conservées même après redéploiement, mais faites des backups réguliers.

3. **FFmpeg** : Installé à chaque build. Le build peut prendre 2-3 minutes à cause de l'installation.

4. **Variables d'environnement** : Ne commitez JAMAIS votre `REPLICATE_API_TOKEN` dans le code. Utilisez toujours les variables d'environnement.
