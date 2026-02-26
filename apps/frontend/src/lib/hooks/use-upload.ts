'use client';

import { useState } from 'react';
import { useApiMutation } from '@presentation-builder-app/libs';
import { uploadApi } from '@/lib/api';

export function useUploadMedia() {
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useApiMutation((file: File) => {
    setUploadProgress(0);
    return uploadApi.upload(file, setUploadProgress);
  });

  return { ...mutation, uploadProgress };
}
