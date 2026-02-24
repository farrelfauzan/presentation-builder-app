import { createZodDto } from 'nestjs-zod';
import {
  globalSettingsResponseDto,
  GlobalSettingsResponseType,
} from './get-global-settings-response.dto';

export class UpdateGlobalSettingsResponseDto extends createZodDto(
  globalSettingsResponseDto,
) {}

export type UpdateGlobalSettingsResponseType = GlobalSettingsResponseType;
