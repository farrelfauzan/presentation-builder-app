import {
  CreateGlobalSettingsResponseDto,
  CreateGlobalSettingsType,
  GlobalSettingsResponseDto,
  UpdateGlobalSettingsResponseDto,
  UpdateGlobalSettingsType,
} from '@presentation-builder-app/libs';

export interface CreateGlobalSettingsData {
  companyName?: string;
  logoUrl?: string;
  address?: string;
  email?: string;
  website?: string;
}

export interface UpdateGlobalSettingsData {
  companyName?: string;
  logoUrl?: string;
  address?: string;
  email?: string;
  website?: string;
}

export interface IGlobalSettingsRepository {
  create(
    data: CreateGlobalSettingsType,
  ): Promise<CreateGlobalSettingsResponseDto>;
  get(): Promise<GlobalSettingsResponseDto | null>;
  update(
    id: string,
    data: UpdateGlobalSettingsType,
  ): Promise<UpdateGlobalSettingsResponseDto>;
}

export const GLOBAL_SETTINGS_REPOSITORY = Symbol('IGlobalSettingsRepository');
