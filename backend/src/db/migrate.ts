import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = process.env.DATABASE_PATH || './backend/data/tiktokgen.db';
const migrationsDir = path.join(__dirname, 'migrations');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Create migrations table to track applied migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get list of migration files
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

// Get already applied migrations
const appliedMigrations = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as Array<{ version: number }>;
const appliedVersions = new Set(appliedMigrations.map(m => m.version));

console.log('Running migrations...');

// Apply each migration
for (const file of migrationFiles) {
  const version = parseInt(file.split('_')[0]);
  
  if (appliedVersions.has(version)) {
    console.log(`Skipping migration ${file} (already applied)`);
    continue;
  }

  console.log(`Applying migration ${file}...`);
  
  const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
  
  db.exec('BEGIN TRANSACTION');
  try {
    db.exec(migrationSQL);
    db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
    db.exec('COMMIT');
    console.log(`✓ Migration ${file} applied successfully`);
  } catch (error) {
    db.exec('ROLLBACK');
    console.error(`✗ Migration ${file} failed:`, error);
    throw error;
  }
}

console.log('All migrations completed!');
db.close();
