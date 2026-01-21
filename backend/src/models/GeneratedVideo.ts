import { z } from 'zod';
import { GenerationParametersSchema, GenerationParameters } from './GenerationParameters';

export const VideoStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

export type VideoStatus = z.infer<typeof VideoStatusSchema>;

export const GeneratedVideoSchema = z.object({
  id: z.string().uuid(),
  character_profile_id: z.string().uuid(),
  text_template_id: z.string().uuid(),
  file_path: z.string().nullable(),
  thumbnail_path: z.string().nullable(),
  generation_provider: z.string().default('replicate'),
  generation_job_id: z.string().nullable(),
  status: VideoStatusSchema.default('pending'),
  duration_seconds: z.number().int().positive().nullable(),
  width: z.number().int().default(1080),
  height: z.number().int().default(1920),
  metadata: z.string().nullable(), // JSON string
  error_message: z.string().nullable(),
  model_name: z.string().default('kwaivgi/kling-v2.5-turbo-pro'),
  generation_parameters: z.string().nullable(), // JSON string of GenerationParameters
  created_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().nullable(),
});

export const CreateGeneratedVideoSchema = GeneratedVideoSchema.omit({
  id: true,
  created_at: true,
  completed_at: true,
}).extend({
  generation_parameters: GenerationParametersSchema.optional(),
});

export const GenerateVideoRequestSchema = z.object({
  character_profile_id: z.string().uuid(),
  text_template_id: z.string().uuid(),
  options: GenerationParametersSchema.optional(),
});

export type GeneratedVideo = z.infer<typeof GeneratedVideoSchema>;
export type CreateGeneratedVideo = z.infer<typeof CreateGeneratedVideoSchema>;
export type GenerateVideoRequest = z.infer<typeof GenerateVideoRequestSchema>;

// Helper functions to serialize/deserialize generation_parameters
export function serializeGenerationParameters(params: GenerationParameters | null | undefined): string | null {
  if (!params) return null;
  return JSON.stringify(params);
}

export function deserializeGenerationParameters(json: string | null | undefined): GenerationParameters | null {
  if (!json) return null;
  try {
    return GenerationParametersSchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}
