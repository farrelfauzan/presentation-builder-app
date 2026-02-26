import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UploadService } from './upload.service';
import {
  parseMultipartRequest,
  validateFile,
  FileValidationError,
  MEDIA_FILE_VALIDATION,
} from '@presentation-builder-app/libs';

@Controller({
  version: '1',
  path: 'upload',
})
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async presign(@Body() body: { filename: string; contentType: string }) {
    if (!body?.filename || !body?.contentType) {
      throw new HttpException(
        'filename and contentType are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.uploadService.getPresignedUploadUrl(
      body.filename,
      body.contentType,
    );

    return {
      data: {
        presignedUrl: result.presignedUrl,
        publicUrl: result.publicUrl,
        mediaType: result.mediaType,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async upload(@Req() req: FastifyRequest) {
    const { file } = await parseMultipartRequest(req, 'file');

    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    try {
      validateFile(file, MEDIA_FILE_VALIDATION);
    } catch (error) {
      if (error instanceof FileValidationError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }

    const result = await this.uploadService.uploadMedia(file);

    return {
      data: {
        url: result.url,
        mediaType: result.mediaType,
      },
    };
  }
}
