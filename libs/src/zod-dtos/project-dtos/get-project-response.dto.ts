import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { slideResponseDto } from '../slide-dtos/get-slide-response.dto';

export const projectResponseDto = z.object({
  id: z.cuid(),
  title: z.string(),
  description: z.string().nullable(),
  version: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  slides: z.array(slideResponseDto).optional(),
});

export class ProjectResponseDto extends createZodDto(projectResponseDto) {}

export type ProjectResponseType = z.infer<typeof projectResponseDto>;
