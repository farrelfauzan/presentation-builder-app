export interface IUploadedFile {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface IFileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
}

export const DEFAULT_FILE_VALIDATION: IFileValidationOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
};

export const VIDEO_FILE_VALIDATION: IFileValidationOptions = {
  maxSize: 500 * 1024 * 1024, // 500MB
  allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
};

export const IMAGE_FILE_VALIDATION: IFileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
};

export const MEDIA_FILE_VALIDATION: IFileValidationOptions = {
  maxSize: 500 * 1024 * 1024, // 500MB
  allowedMimeTypes: [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ],
};
