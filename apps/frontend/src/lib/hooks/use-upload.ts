'use client';

import { useApiMutation } from '@presentation-builder-app/libs';
import { uploadApi } from '../api';

export function useUploadMedia() {
  return useApiMutation((file: File) => uploadApi.upload(file));
}
