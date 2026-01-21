import { z } from 'zod';

export const GenerationParametersSchema = z.object({
  duration: z.union([z.literal(5), z.literal(10)]),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']),
  guidanceScale: z.number().min(1).max(20).optional(),
  negativePrompt: z.string().max(500).optional(),
});

export type GenerationParameters = z.infer<typeof GenerationParametersSchema>;

export const defaultGenerationParameters: GenerationParameters = {
  duration: 5,
  aspectRatio: '9:16',
  guidanceScale: 7.5,
};
