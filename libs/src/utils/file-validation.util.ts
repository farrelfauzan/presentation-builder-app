import {
  IUploadedFile,
  IFileValidationOptions,
  DEFAULT_FILE_VALIDATION,
} from '../interfaces';

export class FileValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export function validateFile(
  file: IUploadedFile,
  options: IFileValidationOptions = DEFAULT_FILE_VALIDATION,
): void {
  const { maxSize, allowedMimeTypes } = options;

  if (maxSize && file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new FileValidationError(
      `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      'FILE_TOO_LARGE',
    );
  }

  if (allowedMimeTypes && allowedMimeTypes.length > 0) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new FileValidationError(
        `File type '${file.mimetype}' is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
        'INVALID_FILE_TYPE',
      );
    }
  }
}

export function isImageMimeType(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}

export function isVideoMimeType(mimetype: string): boolean {
  return mimetype.startsWith('video/');
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot) : '';
}
