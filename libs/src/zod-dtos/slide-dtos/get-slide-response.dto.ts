import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { mediaTypeEnum } from './create-slide.dto';

export const slideResponseDto = z.object({
  id: z.cuid(),
  projectId: z.cuid(),
  order: z.number().int(),
  textContent: z.string().nullable(),
  mediaUrl: z.string().nullable(),
  mediaType: mediaTypeEnum.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export class SlideResponseDto extends createZodDto(slideResponseDto) {}

export type SlideResponseType = z.infer<typeof slideResponseDto>;
