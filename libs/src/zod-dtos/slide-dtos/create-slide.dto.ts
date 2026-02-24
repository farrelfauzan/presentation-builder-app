import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const mediaTypeEnum = z.enum(['image', 'video']);

export const createSlideDto = z.object({
  projectId: z.cuid(),
  order: z.number().int().min(0),
  textContent: z.string().optional(),
  mediaUrl: z.url().optional(),
  mediaType: mediaTypeEnum.optional(),
});

export class CreateSlideDto extends createZodDto(createSlideDto) {}

export type CreateSlideType = z.infer<typeof createSlideDto>;
export type MediaType = z.infer<typeof mediaTypeEnum>;
