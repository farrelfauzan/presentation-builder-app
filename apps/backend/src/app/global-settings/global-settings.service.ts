import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateGlobalSettingsDto,
  CreateGlobalSettingsResponseDto,
  GlobalSettingsResponseDto,
  UpdateGlobalSettingsDto,
  UpdateGlobalSettingsResponseDto,
  IUploadedFile,
  getFileExtension,
} from '@presentation-builder-app/libs';
import {
  IGlobalSettingsRepository,
  GLOBAL_SETTINGS_REPOSITORY,
} from './domain/ports/global-settings.port';
import { MinioService } from '../minio/minio.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GlobalSettingsService {
  private readonly LOGO_PATH = 'global-settings/logos';

  constructor(
    @Inject(GLOBAL_SETTINGS_REPOSITORY)
    private readonly repository: IGlobalSettingsRepository,
    private readonly minioService: MinioService,
  ) {}

  async create(
    dto: CreateGlobalSettingsDto,
    logoFile?: IUploadedFile,
  ): Promise<CreateGlobalSettingsResponseDto> {
    let logoUrl: string | undefined;

    if (logoFile) {
      logoUrl = await this.uploadLogo(logoFile);
    }

    return this.repository.create({
      companyName: dto.companyName,
      logoUrl,
      address: dto.address,
      email: dto.email,
      website: dto.website,
    });
  }

  async get(): Promise<GlobalSettingsResponseDto> {
    const settings = await this.repository.get();
    if (!settings) {
      throw new HttpException(
        'Global settings not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return settings;
  }

  async update(
    dto: UpdateGlobalSettingsDto,
    logoFile?: IUploadedFile,
    deleteLogo = false,
  ): Promise<UpdateGlobalSettingsResponseDto> {
    const existingSettings = await this.repository.get();
    if (!existingSettings) {
      throw new HttpException(
        'Global settings not found',
        HttpStatus.NOT_FOUND,
      );
    }

    let logoUrl: string | undefined | null;

    if (logoFile) {
      // Delete old logo if exists
      if (existingSettings.logoUrl) {
        try {
          await this.minioService.deleteFile(existingSettings.logoUrl);
        } catch {
          // Ignore delete errors for old file
        }
      }
      logoUrl = await this.uploadLogo(logoFile);
    } else if (deleteLogo) {
      // User explicitly removed the logo
      if (existingSettings.logoUrl) {
        try {
          await this.minioService.deleteFile(existingSettings.logoUrl);
        } catch {
          // Ignore delete errors for old file
        }
      }
      logoUrl = null;
    }

    return this.repository.update(existingSettings.id, {
      companyName: dto.companyName,
      logoUrl,
      address: dto.address,
      email: dto.email,
      website: dto.website,
    });
  }

  private async uploadLogo(file: IUploadedFile): Promise<string> {
    const ext = getFileExtension(file.filename);
    const objectName = `${this.LOGO_PATH}/${uuidv4()}${ext}`;

    const result = await this.minioService.uploadBuffer(
      file.buffer,
      objectName,
      { 'Content-Type': file.mimetype },
    );

    return result.url;
  }
}
