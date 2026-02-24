import type { FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { IUploadedFile } from '../interfaces';

export interface IParsedMultipartData {
  fields: Record<string, string>;
  file?: IUploadedFile;
}

export async function parseMultipartRequest(
  request: FastifyRequest,
  fileFieldName: string = 'file',
): Promise<IParsedMultipartData> {
  const fields: Record<string, string> = {};
  let file: IUploadedFile | undefined;

  const parts = request.parts();

  for await (const part of parts) {
    if (part.type === 'file') {
      if (part.fieldname === fileFieldName && part.filename) {
        const buffer = await part.toBuffer();
        file = {
          fieldname: part.fieldname,
          filename: part.filename,
          encoding: part.encoding,
          mimetype: part.mimetype,
          buffer,
          size: buffer.length,
        };
      }
    } else {
      fields[part.fieldname] = part.value as string;
    }
  }

  return { fields, file };
}

export async function parseMultipartFiles(
  request: FastifyRequest,
  fileFieldNames: string[] = ['file'],
): Promise<{
  fields: Record<string, string>;
  files: Record<string, IUploadedFile>;
}> {
  const fields: Record<string, string> = {};
  const files: Record<string, IUploadedFile> = {};

  const parts = request.parts();

  for await (const part of parts) {
    if (part.type === 'file') {
      if (fileFieldNames.includes(part.fieldname) && part.filename) {
        const buffer = await part.toBuffer();
        files[part.fieldname] = {
          fieldname: part.fieldname,
          filename: part.filename,
          encoding: part.encoding,
          mimetype: part.mimetype,
          buffer,
          size: buffer.length,
        };
      }
    } else {
      fields[part.fieldname] = part.value as string;
    }
  }

  return { fields, files };
}
