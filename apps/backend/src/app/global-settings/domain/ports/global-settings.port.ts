import {
  CreateGlobalSettingsDto,
  CreateGlobalSettingsResponseDto,
  GlobalSettingsResponseDto,
  UpdateGlobalSettingsDto,
  UpdateGlobalSettingsResponseDto,
} from '@presentation-builder-app/libs';

export interface IGlobalSettingsRepository {
  create(
    options: CreateGlobalSettingsDto,
  ): Promise<CreateGlobalSettingsResponseDto>;
  get(): Promise<GlobalSettingsResponseDto | null>;
  update(
    options: UpdateGlobalSettingsDto,
  ): Promise<UpdateGlobalSettingsResponseDto>;
}
