import { Injectable } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import {
  IUploadedFile,
  getFileExtension,
  isImageMimeType,
  isVideoMimeType,
} from '@presentation-builder-app/libs';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  mediaType: 'image' | 'video' | null;
}

@Injectable()
export class UploadService {
  private readonly MEDIA_PATH = 'slides/media';

  constructor(private readonly minioService: MinioService) {}

  async uploadMedia(file: IUploadedFile): Promise<UploadResult> {
    const ext = getFileExtension(file.filename);
    const objectName = `${this.MEDIA_PATH}/${uuidv4()}${ext}`;

    const result = await this.minioService.uploadBuffer(
      file.buffer,
      objectName,
      { 'Content-Type': file.mimetype },
    );

    let mediaType: 'image' | 'video' | null = null;
    if (isImageMimeType(file.mimetype)) {
      mediaType = 'image';
    } else if (isVideoMimeType(file.mimetype)) {
      mediaType = 'video';
    }

    return {
      url: result.url,
      mediaType,
    };
  }
}
