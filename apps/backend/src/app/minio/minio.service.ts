import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ItemBucketMetadata } from 'minio';
import * as path from 'path';

export interface UploadResult {
  objectName: string;
  url: string;
  etag: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly bucketName: string;
  public readonly baseUrl: string;
  public readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const useSSL = this.parseBoolean(
      this.configService.get<string>('MINIO_USE_SSL'),
    );

    const endPoint = this.configService.getOrThrow<string>('MINIO_HOST');
    const port = Number(this.configService.getOrThrow<string>('MINIO_PORT'));

    this.client = new Client({
      endPoint,
      port,
      useSSL,
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });

    this.bucketName =
      this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');

    const cleanEndpoint = endPoint.endsWith('/')
      ? endPoint.slice(0, -1)
      : endPoint;
    this.baseUrl = `${useSSL ? 'https' : 'http'}://${cleanEndpoint}:${port}/${this.bucketName}`;

    // Use MINIO_PUBLIC_URL for production, fallback to baseUrl for development
    const configuredPublicUrl =
      this.configService.get<string>('MINIO_PUBLIC_URL');
    this.publicUrl = configuredPublicUrl
      ? `${configuredPublicUrl.replace(/\/$/, '')}/${this.bucketName}`
      : this.baseUrl;
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists();
  }

  private parseBoolean(value: string | null | undefined): boolean {
    if (!value) return false;
    return ['true', '1', 'yes'].includes(value.toLowerCase());
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName);
        this.logger.log(`Bucket "${this.bucketName}" created`);
      }

      // Set public read policy so the browser can fetch media directly
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };
      await this.client.setBucketPolicy(
        this.bucketName,
        JSON.stringify(policy),
      );
      this.logger.log(`Public read policy set for bucket "${this.bucketName}"`);
    } catch (error) {
      this.logger.error(`Failed to ensure bucket exists: ${error}`);
      throw error;
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    objectName: string,
    metadata?: ItemBucketMetadata,
  ): Promise<UploadResult> {
    const contentType = this.getContentType(objectName);
    const meta: ItemBucketMetadata = {
      'Content-Type': contentType,
      ...metadata,
    };

    const result = await this.client.putObject(
      this.bucketName,
      objectName,
      buffer,
      buffer.length,
      meta,
    );

    return {
      objectName,
      url: this.getObjectUrl(objectName),
      etag: result.etag,
    };
  }

  async uploadFile(
    filePath: string,
    objectName?: string,
    metadata?: ItemBucketMetadata,
  ): Promise<UploadResult> {
    const finalObjectName = objectName || path.basename(filePath);
    const contentType = this.getContentType(finalObjectName);
    const meta: ItemBucketMetadata = {
      'Content-Type': contentType,
      ...metadata,
    };

    const result = await this.client.fPutObject(
      this.bucketName,
      finalObjectName,
      filePath,
      meta,
    );

    return {
      objectName: finalObjectName,
      url: this.getObjectUrl(finalObjectName),
      etag: result.etag,
    };
  }

  async deleteFile(filePathOrUrl: string): Promise<void> {
    const objectName = this.extractObjectName(filePathOrUrl);
    await this.client.removeObject(this.bucketName, objectName);
  }

  async deleteFiles(objectNames: string[]): Promise<void> {
    const objects = objectNames.map((name) => ({
      name: this.extractObjectName(name),
    }));
    await this.client.removeObjects(this.bucketName, objects);
  }

  async getPresignedUrl(
    objectName: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    return this.client.presignedGetObject(
      this.bucketName,
      objectName,
      expirySeconds,
    );
  }

  async getPresignedPutUrl(
    objectName: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    return this.client.presignedPutObject(
      this.bucketName,
      objectName,
      expirySeconds,
    );
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, objectName);
      return true;
    } catch {
      return false;
    }
  }

  getObjectUrl(objectName: string): string {
    const cleanObjectName = objectName.startsWith('/')
      ? objectName.slice(1)
      : objectName;
    return `${this.publicUrl}/${cleanObjectName}`;
  }

  private extractObjectName(filePathOrUrl: string): string {
    let objectName = filePathOrUrl;

    // Remove public URL if present
    if (objectName.startsWith(this.publicUrl)) {
      const publicUrl = this.publicUrl.endsWith('/')
        ? this.publicUrl
        : `${this.publicUrl}/`;
      objectName = objectName.replace(publicUrl, '');
    }

    // Remove base URL if present
    if (objectName.startsWith(this.baseUrl)) {
      const baseUrl = this.baseUrl.endsWith('/')
        ? this.baseUrl
        : `${this.baseUrl}/`;
      objectName = objectName.replace(baseUrl, '');
    }

    // Remove bucket name prefix if present
    if (objectName.startsWith(this.bucketName)) {
      const bucketPrefix = this.bucketName.endsWith('/')
        ? this.bucketName
        : `${this.bucketName}/`;
      objectName = objectName.replace(bucketPrefix, '');
    }

    // Remove leading slash
    if (objectName.startsWith('/')) {
      objectName = objectName.slice(1);
    }

    return objectName;
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
