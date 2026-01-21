import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import characterProfilesRouter from './routes/character-profiles';
import textTemplatesRouter from './routes/text-templates';
import videoGenerationRouter from './routes/video-generation';
import { getDatabase } from './services/database';

// Load environment variables
dotenv.config();

// Run migrations on startup
try {
  const migrateScript = path.join(__dirname, 'db', 'migrate.ts');
  if (fs.existsSync(migrateScript)) {
    require('./db/migrate');
  }
} catch (error) {
  console.warn('Could not run migrations automatically:', error);
  console.log('Please run: npm run migrate');
}

// Ensure videos directory exists
const videosDir = process.env.VIDEOS_DIR || './videos';
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log(`📁 Created videos directory: ${videosDir}`);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Render uses PORT environment variable, fallback to 3001 for local dev

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/character-profiles', characterProfilesRouter);
app.use('/api/text-templates', textTemplatesRouter);
app.use('/api', videoGenerationRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_PATH || './backend/data/tiktokgen.db'}`);
  console.log(`🎬 Videos directory: ${process.env.VIDEOS_DIR || './videos'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  getDatabase().close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  getDatabase().close();
  process.exit(0);
});
