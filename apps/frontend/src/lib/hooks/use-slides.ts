'use client';

import {
  useApiQuery,
  useApiMutation,
  STALE_TIMES,
} from '@presentation-builder-app/libs';
import {
  slideApi,
  type CreateSlidePayload,
  type UpdateSlidePayload,
  type ReorderSlidesPayload,
} from '../api';

export const slideKeys = {
  all: (projectId: string): [string, string] => ['slides', projectId],
  detail: (id: string): [string, string, string] => ['slides', 'detail', id],
};

export function useSlides(projectId: string) {
  return useApiQuery(
    slideKeys.all(projectId),
    () => slideApi.getAll(projectId),
    { enabled: !!projectId, staleTime: STALE_TIMES.SHORT },
  );
}

export function useSlide(id: string) {
  return useApiQuery(slideKeys.detail(id), () => slideApi.getOne(id), {
    enabled: !!id,
    staleTime: STALE_TIMES.SHORT,
  });
}

export function useCreateSlide(projectId: string) {
  return useApiMutation(
    (data: CreateSlidePayload) => slideApi.create(projectId, data),
    { invalidateQueries: [slideKeys.all(projectId)] },
  );
}

export function useUpdateSlide(projectId: string) {
  return useApiMutation(
    ({ id, data }: { id: string; data: UpdateSlidePayload }) =>
      slideApi.update(id, data),
    { invalidateQueries: [slideKeys.all(projectId)] },
  );
}

export function useDeleteSlide(projectId: string) {
  return useApiMutation((id: string) => slideApi.delete(id), {
    invalidateQueries: [slideKeys.all(projectId)],
  });
}

export function useReorderSlides(projectId: string) {
  return useApiMutation(
    (data: ReorderSlidesPayload) => slideApi.reorder(projectId, data),
    { invalidateQueries: [slideKeys.all(projectId)] },
  );
}
