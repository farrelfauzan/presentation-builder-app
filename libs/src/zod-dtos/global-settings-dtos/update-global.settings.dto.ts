import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const updateGlobalSettingsDto = z.object({
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

export class UpdateGlobalSettingsDto extends createZodDto(
  updateGlobalSettingsDto,
) {}

export type UpdateGlobalSettingsType = z.infer<typeof updateGlobalSettingsDto>;
