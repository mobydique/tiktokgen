-- Migration: Initial schema for TikTok video generation system
-- Created: 2024

-- Table: ai_character_profiles
-- Stores reusable AI character profiles for consistent video generation
CREATE TABLE IF NOT EXISTS ai_character_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    character_prompt TEXT NOT NULL,
    seed INTEGER,
    style TEXT NOT NULL CHECK(style IN ('dancing', 'sexy', 'casual', 'elegant', 'cute', 'sporty')),
    telegram_username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: promotion_text_templates
-- Stores reusable text templates for video overlays
CREATE TABLE IF NOT EXISTS promotion_text_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    text_content TEXT NOT NULL,
    telegram_username TEXT,
    telegram_link TEXT,
    position TEXT NOT NULL DEFAULT 'bottom' CHECK(position IN ('top', 'bottom', 'center')),
    font_size INTEGER NOT NULL DEFAULT 24,
    font_color TEXT NOT NULL DEFAULT '#FFFFFF',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: generated_videos
-- Stores metadata about generated videos
CREATE TABLE IF NOT EXISTS generated_videos (
    id TEXT PRIMARY KEY,
    character_profile_id TEXT NOT NULL,
    text_template_id TEXT NOT NULL,
    file_path TEXT,
    thumbnail_path TEXT,
    generation_provider TEXT NOT NULL DEFAULT 'replicate',
    generation_job_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
    duration_seconds INTEGER,
    width INTEGER DEFAULT 1080,
    height INTEGER DEFAULT 1920,
    metadata TEXT, -- JSON string for additional metadata
    error_message TEXT,
    model_name TEXT NOT NULL DEFAULT 'kwaivgi/kling-v2.5-turbo-pro',
    generation_parameters TEXT, -- JSON string for duration, aspectRatio, guidanceScale, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (character_profile_id) REFERENCES ai_character_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (text_template_id) REFERENCES promotion_text_templates(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(status);
CREATE INDEX IF NOT EXISTS idx_generated_videos_character_profile ON generated_videos(character_profile_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_text_template ON generated_videos(text_template_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_created_at ON generated_videos(created_at DESC);
