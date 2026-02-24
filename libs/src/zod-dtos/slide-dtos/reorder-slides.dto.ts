import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const reorderSlidesDto = z.object({
  slideIds: z.array(z.cuid()).min(1, 'At least one slide ID is required'),
});

export class ReorderSlidesDto extends createZodDto(reorderSlidesDto) {}

export type ReorderSlidesType = z.infer<typeof reorderSlidesDto>;
