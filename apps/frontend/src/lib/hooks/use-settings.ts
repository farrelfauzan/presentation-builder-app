'use client';

import {
  useApiQuery,
  useApiMutation,
  STALE_TIMES,
} from '@presentation-builder-app/libs';
import { settingsApi } from '@/lib/api';

export const settingsKeys = {
  all: 'global-settings' as const,
};

export function useGlobalSettings() {
  return useApiQuery(settingsKeys.all, () => settingsApi.get(), {
    staleTime: STALE_TIMES.LONG,
  });
}

export function useCreateSettings() {
  return useApiMutation((formData: FormData) => settingsApi.create(formData), {
    invalidateQueries: [settingsKeys.all],
  });
}

export function useUpdateSettings() {
  return useApiMutation((formData: FormData) => settingsApi.update(formData), {
    invalidateQueries: [settingsKeys.all],
  });
}
