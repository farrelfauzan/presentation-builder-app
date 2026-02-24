import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const getProjectDto = z.object({
  id: z.cuid(),
});

export class GetProjectDto extends createZodDto(getProjectDto) {}

export type GetProjectType = z.infer<typeof getProjectDto>;
