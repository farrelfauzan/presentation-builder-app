import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const mediaTypeEnum = z.enum(['image', 'video']);

export const createSlideDto = z.object({
  order: z.number().int().min(0).optional(),
  textContent: z.string().optional(),
  mediaUrl: z.url().optional(),
  mediaType: mediaTypeEnum.optional(),
});

// Internal type used by repository (includes projectId)
export const createSlideInternalDto = createSlideDto.extend({
  projectId: z.cuid(),
});

export class CreateSlideDto extends createZodDto(createSlideDto) {}

export type CreateSlideType = z.infer<typeof createSlideInternalDto>;
export type MediaType = z.infer<typeof mediaTypeEnum>;
