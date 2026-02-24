import { createZodDto } from 'nestjs-zod';
import {
  globalSettingsResponseDto,
  GlobalSettingsResponseType,
} from './get-global-settings-response.dto';

export class CreateGlobalSettingsResponseDto extends createZodDto(
  globalSettingsResponseDto,
) {}

export type CreateGlobalSettingsResponseType = GlobalSettingsResponseType;
