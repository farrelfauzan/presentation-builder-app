import {
  Controller,
  Get,
  Post,
  Patch,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { GlobalSettingsService } from './global-settings.service';
import {
  CreateGlobalSettingsResponseDto,
  GlobalSettingsResponseDto,
  UpdateGlobalSettingsResponseDto,
  parseMultipartRequest,
  validateFile,
  FileValidationError,
  IMAGE_FILE_VALIDATION,
} from '@presentation-builder-app/libs';

@Controller({
  version: '1',
  path: 'global-settings',
})
export class GlobalSettingsController {
  constructor(private readonly globalSettingsService: GlobalSettingsService) {}

  @Post()
  async create(
    @Req() req: FastifyRequest,
  ): Promise<{ data: CreateGlobalSettingsResponseDto }> {
    const { fields, file } = await parseMultipartRequest(req, 'logo');

    if (file) {
      try {
        validateFile(file, IMAGE_FILE_VALIDATION);
      } catch (error) {
        if (error instanceof FileValidationError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
        throw error;
      }
    }

    const dto = {
      companyName: fields.companyName,
      address: fields.address,
      email: fields.email,
      website: fields.website,
    };

    const data = await this.globalSettingsService.create(dto, file);
    return { data };
  }

  @Get()
  async get(): Promise<{ data: GlobalSettingsResponseDto }> {
    const data = await this.globalSettingsService.get();
    return { data };
  }

  @Patch()
  async update(
    @Req() req: FastifyRequest,
  ): Promise<{ data: UpdateGlobalSettingsResponseDto }> {
    const { fields, file } = await parseMultipartRequest(req, 'logo');

    if (file) {
      try {
        validateFile(file, IMAGE_FILE_VALIDATION);
      } catch (error) {
        if (error instanceof FileValidationError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
        throw error;
      }
    }

    const deleteLogo = fields.deleteLogo === 'true';

    const dto = {
      companyName: fields.companyName,
      address: fields.address,
      email: fields.email,
      website: fields.website,
    };

    const data = await this.globalSettingsService.update(dto, file, deleteLogo);
    return { data };
  }
}
