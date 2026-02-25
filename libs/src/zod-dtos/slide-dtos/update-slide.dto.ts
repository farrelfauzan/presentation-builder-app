import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { mediaTypeEnum } from './create-slide.dto';

export const updateSlideDto = z.object({
  order: z.number().int().min(0).optional(),
  textContent: z.string().optional(),
  mediaUrl: z.url().nullable().optional(),
  mediaType: mediaTypeEnum.nullable().optional(),
});

export class UpdateSlideDto extends createZodDto(updateSlideDto) {}

export type UpdateSlideType = z.infer<typeof updateSlideDto>;
