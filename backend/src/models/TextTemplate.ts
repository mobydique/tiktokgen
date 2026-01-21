import { z } from 'zod';

export const TextPositionSchema = z.enum(['top', 'bottom', 'center']);

export type TextPosition = z.infer<typeof TextPositionSchema>;

export const TextTemplateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  text_content: z.string().min(1).max(500),
  telegram_username: z.string().max(50).optional(),
  telegram_link: z.string().url().optional(),
  position: TextPositionSchema.default('bottom'),
  font_size: z.number().int().min(12).max(72).default(24),
  font_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateTextTemplateSchema = TextTemplateSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateTextTemplateSchema = CreateTextTemplateSchema.partial();

export type TextTemplate = z.infer<typeof TextTemplateSchema>;
export type CreateTextTemplate = z.infer<typeof CreateTextTemplateSchema>;
export type UpdateTextTemplate = z.infer<typeof UpdateTextTemplateSchema>;
