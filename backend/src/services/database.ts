import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  CharacterProfile,
  CreateCharacterProfile,
  UpdateCharacterProfile,
} from '../models/CharacterProfile';
import {
  TextTemplate,
  CreateTextTemplate,
  UpdateTextTemplate,
} from '../models/TextTemplate';
import {
  GeneratedVideo,
  CreateGeneratedVideo,
  serializeGenerationParameters,
  deserializeGenerationParameters,
} from '../models/GeneratedVideo';

const dbPath = process.env.DATABASE_PATH || './backend/data/tiktokgen.db';

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  // Character Profiles CRUD
  createCharacterProfile(data: CreateCharacterProfile): CharacterProfile {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    this.db
      .prepare(
        `INSERT INTO ai_character_profiles 
         (id, name, character_prompt, seed, style, telegram_username, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        data.name,
        data.character_prompt,
        data.seed ?? null,
        data.style,
        data.telegram_username ?? null,
        now,
        now
      );

    return this.getCharacterProfile(id)!;
  }

  getCharacterProfile(id: string): CharacterProfile | null {
    const row = this.db
      .prepare('SELECT * FROM ai_character_profiles WHERE id = ?')
      .get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      character_prompt: row.character_prompt,
      seed: row.seed ?? undefined,
      style: row.style,
      telegram_username: row.telegram_username ?? undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  getAllCharacterProfiles(): CharacterProfile[] {
    const rows = this.db
      .prepare('SELECT * FROM ai_character_profiles ORDER BY created_at DESC')
      .all() as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      character_prompt: row.character_prompt,
      seed: row.seed ?? undefined,
      style: row.style,
      telegram_username: row.telegram_username ?? undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  updateCharacterProfile(id: string, data: UpdateCharacterProfile): CharacterProfile | null {
    const existing = this.getCharacterProfile(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.character_prompt !== undefined) {
      updates.push('character_prompt = ?');
      values.push(data.character_prompt);
    }
    if (data.seed !== undefined) {
      updates.push('seed = ?');
      values.push(data.seed);
    }
    if (data.style !== undefined) {
      updates.push('style = ?');
      values.push(data.style);
    }
    if (data.telegram_username !== undefined) {
      updates.push('telegram_username = ?');
      values.push(data.telegram_username);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    this.db
      .prepare(`UPDATE ai_character_profiles SET ${updates.join(', ')} WHERE id = ?`)
      .run(...values);

    return this.getCharacterProfile(id);
  }

  deleteCharacterProfile(id: string): boolean {
    const result = this.db.prepare('DELETE FROM ai_character_profiles WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Text Templates CRUD
  createTextTemplate(data: CreateTextTemplate): TextTemplate {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO promotion_text_templates
         (id, title, text_content, telegram_username, telegram_link, position, font_size, font_color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        data.title,
        data.text_content,
        data.telegram_username ?? null,
        data.telegram_link ?? null,
        data.position ?? 'bottom',
        data.font_size ?? 24,
        data.font_color ?? '#FFFFFF',
        now,
        now
      );

    return this.getTextTemplate(id)!;
  }

  getTextTemplate(id: string): TextTemplate | null {
    const row = this.db
      .prepare('SELECT * FROM promotion_text_templates WHERE id = ?')
      .get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      text_content: row.text_content,
      telegram_username: row.telegram_username ?? undefined,
      telegram_link: row.telegram_link ?? undefined,
      position: row.position,
      font_size: row.font_size,
      font_color: row.font_color,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  getAllTextTemplates(): TextTemplate[] {
    const rows = this.db
      .prepare('SELECT * FROM promotion_text_templates ORDER BY created_at DESC')
      .all() as any[];

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      text_content: row.text_content,
      telegram_username: row.telegram_username ?? undefined,
      telegram_link: row.telegram_link ?? undefined,
      position: row.position,
      font_size: row.font_size,
      font_color: row.font_color,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  updateTextTemplate(id: string, data: UpdateTextTemplate): TextTemplate | null {
    const existing = this.getTextTemplate(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.text_content !== undefined) {
      updates.push('text_content = ?');
      values.push(data.text_content);
    }
    if (data.telegram_username !== undefined) {
      updates.push('telegram_username = ?');
      values.push(data.telegram_username);
    }
    if (data.telegram_link !== undefined) {
      updates.push('telegram_link = ?');
      values.push(data.telegram_link);
    }
    if (data.position !== undefined) {
      updates.push('position = ?');
      values.push(data.position);
    }
    if (data.font_size !== undefined) {
      updates.push('font_size = ?');
      values.push(data.font_size);
    }
    if (data.font_color !== undefined) {
      updates.push('font_color = ?');
      values.push(data.font_color);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    this.db
      .prepare(`UPDATE promotion_text_templates SET ${updates.join(', ')} WHERE id = ?`)
      .run(...values);

    return this.getTextTemplate(id);
  }

  deleteTextTemplate(id: string): boolean {
    const result = this.db.prepare('DELETE FROM promotion_text_templates WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Generated Videos CRUD
  createGeneratedVideo(data: CreateGeneratedVideo): GeneratedVideo {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO generated_videos
         (id, character_profile_id, text_template_id, file_path, thumbnail_path,
          generation_provider, generation_job_id, status, duration_seconds,
          width, height, metadata, error_message, model_name, generation_parameters,
          created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        data.character_profile_id,
        data.text_template_id,
        data.file_path ?? null,
        data.thumbnail_path ?? null,
        data.generation_provider ?? 'replicate',
        data.generation_job_id ?? null,
        data.status ?? 'pending',
        data.duration_seconds ?? null,
        data.width ?? 1080,
        data.height ?? 1920,
        data.metadata ?? null,
        data.error_message ?? null,
        data.model_name ?? 'kwaivgi/kling-v2.5-turbo-pro',
        serializeGenerationParameters(data.generation_parameters),
        now,
        data.completed_at ?? null
      );

    return this.getGeneratedVideo(id)!;
  }

  getGeneratedVideo(id: string): GeneratedVideo | null {
    const row = this.db
      .prepare('SELECT * FROM generated_videos WHERE id = ?')
      .get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      character_profile_id: row.character_profile_id,
      text_template_id: row.text_template_id,
      file_path: row.file_path,
      thumbnail_path: row.thumbnail_path,
      generation_provider: row.generation_provider,
      generation_job_id: row.generation_job_id,
      status: row.status,
      duration_seconds: row.duration_seconds,
      width: row.width,
      height: row.height,
      metadata: row.metadata,
      error_message: row.error_message,
      model_name: row.model_name,
      generation_parameters: row.generation_parameters,
      created_at: row.created_at,
      completed_at: row.completed_at,
    };
  }

  getAllGeneratedVideos(status?: string): GeneratedVideo[] {
    let query = 'SELECT * FROM generated_videos';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const rows = this.db.prepare(query).all(...params) as any[];

    return rows.map((row) => ({
      id: row.id,
      character_profile_id: row.character_profile_id,
      text_template_id: row.text_template_id,
      file_path: row.file_path,
      thumbnail_path: row.thumbnail_path,
      generation_provider: row.generation_provider,
      generation_job_id: row.generation_job_id,
      status: row.status,
      duration_seconds: row.duration_seconds,
      width: row.width,
      height: row.height,
      metadata: row.metadata,
      error_message: row.error_message,
      model_name: row.model_name,
      generation_parameters: row.generation_parameters,
      created_at: row.created_at,
      completed_at: row.completed_at,
    }));
  }

  updateGeneratedVideo(id: string, updates: Partial<GeneratedVideo>): GeneratedVideo | null {
    const existing = this.getGeneratedVideo(id);
    if (!existing) return null;

    const updateFields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'created_at') return;
      
      if (key === 'generation_parameters' && value !== undefined) {
        updateFields.push('generation_parameters = ?');
        values.push(typeof value === 'string' ? value : serializeGenerationParameters(value as any));
      } else if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) return existing;

    if (updates.status === 'completed' && !updates.completed_at) {
      updateFields.push('completed_at = ?');
      values.push(new Date().toISOString());
    }

    values.push(id);

    this.db
      .prepare(`UPDATE generated_videos SET ${updateFields.join(', ')} WHERE id = ?`)
      .run(...values);

    return this.getGeneratedVideo(id);
  }

  deleteGeneratedVideo(id: string): boolean {
    const result = this.db.prepare('DELETE FROM generated_videos WHERE id = ?').run(id);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

export default DatabaseService;
