import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const updateProjectDto = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  version: z.string().optional(),
});

export class UpdateProjectDto extends createZodDto(updateProjectDto) {}

export type UpdateProjectType = z.infer<typeof updateProjectDto>;
