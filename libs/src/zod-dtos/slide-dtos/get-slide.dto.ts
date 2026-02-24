import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const getSlideDto = z.object({
  id: z.cuid(),
});

export class GetSlideDto extends createZodDto(getSlideDto) {}

export type GetSlideType = z.infer<typeof getSlideDto>;
