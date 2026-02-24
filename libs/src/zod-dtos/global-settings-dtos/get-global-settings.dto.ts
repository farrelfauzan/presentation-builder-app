import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const getGlobalSettingsDto = z.object({
  id: z.cuid(),
});

export class GetGlobalSettingsDto extends createZodDto(getGlobalSettingsDto) {}

export type GetGlobalSettingsType = z.infer<typeof getGlobalSettingsDto>;
