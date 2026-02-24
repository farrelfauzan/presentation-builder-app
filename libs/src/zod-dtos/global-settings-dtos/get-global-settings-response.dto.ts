import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const globalSettingsResponseDto = z.object({
  id: z.cuid(),
  companyName: z.string().nullable(),
  logoUrl: z.string().nullable(),
  address: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export class GlobalSettingsResponseDto extends createZodDto(
  globalSettingsResponseDto,
) {}

export type GlobalSettingsResponseType = z.infer<
  typeof globalSettingsResponseDto
>;
