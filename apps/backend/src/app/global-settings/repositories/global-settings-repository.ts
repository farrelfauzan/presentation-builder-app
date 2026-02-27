import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IGlobalSettingsRepository } from '../domain/ports/global-settings.port';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateGlobalSettingsResponseDto,
  CreateGlobalSettingsType,
  GlobalSettingsResponseDto,
  UpdateGlobalSettingsResponseDto,
  UpdateGlobalSettingsType,
} from '@presentation-builder-app/libs';
import { GlobalSettings } from '../../prisma/generated/client';

@Injectable()
export class GlobalSettingsRepository implements IGlobalSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateGlobalSettingsType,
  ): Promise<CreateGlobalSettingsResponseDto> {
    const existingSettings = await this.prisma.findFirstActive<GlobalSettings>(
      this.prisma.globalSettings,
      {
        where: {
          deletedAt: null,
        },
      },
    );

    if (existingSettings) {
      throw new HttpException(
        'Global settings already exists',
        HttpStatus.CONFLICT,
      );
    }

    const createdGlobalSettings = await this.prisma.globalSettings.create({
      data: {
        companyName: data.companyName,
        logoUrl: data.logoUrl,
        address: data.address,
        email: data.email,
        website: data.website,
      },
    });

    return createdGlobalSettings as unknown as CreateGlobalSettingsResponseDto;
  }

  async get(): Promise<GlobalSettingsResponseDto | null> {
    const globalSettings = await this.prisma.findFirstActive<GlobalSettings>(
      this.prisma.globalSettings,
      {
        where: {
          deletedAt: null,
        },
      },
    );

    if (!globalSettings) {
      return null;
    }

    return globalSettings as unknown as GlobalSettingsResponseDto;
  }

  async update(
    id: string,
    data: UpdateGlobalSettingsType,
  ): Promise<UpdateGlobalSettingsResponseDto> {
    const existingSettings = await this.prisma.findFirstActive<GlobalSettings>(
      this.prisma.globalSettings,
      {
        where: {
          id,
          deletedAt: null,
        },
      },
    );

    if (!existingSettings) {
      throw new HttpException(
        'Global settings not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedSettings = await this.prisma.globalSettings.update({
      where: { id },
      data: {
        companyName: data.companyName ?? existingSettings.companyName,
        logoUrl:
          data.logoUrl !== undefined ? data.logoUrl : existingSettings.logoUrl,
        address: data.address ?? existingSettings.address,
        email: data.email ?? existingSettings.email,
        website: data.website ?? existingSettings.website,
      },
    });

    return updatedSettings as unknown as UpdateGlobalSettingsResponseDto;
  }
}
