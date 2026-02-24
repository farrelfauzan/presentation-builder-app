import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createProjectDto = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  version: z.string().optional(),
});

export class CreateProjectDto extends createZodDto(createProjectDto) {}

export type CreateProjectType = z.infer<typeof createProjectDto>;
