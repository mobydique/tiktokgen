import { z } from 'zod';

export const CharacterStyleSchema = z.enum([
  'dancing',
  'sexy',
  'casual',
  'elegant',
  'cute',
  'sporty',
]);

export type CharacterStyle = z.infer<typeof CharacterStyleSchema>;

export const CharacterProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  character_prompt: z.string().min(10).max(500),
  seed: z.number().int().optional(),
  style: CharacterStyleSchema,
  telegram_username: z.string().max(50).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateCharacterProfileSchema = CharacterProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateCharacterProfileSchema = CreateCharacterProfileSchema.partial();

export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;
export type CreateCharacterProfile = z.infer<typeof CreateCharacterProfileSchema>;
export type UpdateCharacterProfile = z.infer<typeof UpdateCharacterProfileSchema>;
