import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createGlobalSettingsDto = z.object({
  companyName: z.string().optional(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  email: z
    .email({
      message: 'Invalid email address',
    })
    .optional(),
  website: z.string().optional(),
});

export class CreateGlobalSettingsDto extends createZodDto(
  createGlobalSettingsDto,
) {}

export type CreateGlobalSettingsType = z.infer<typeof createGlobalSettingsDto>;
