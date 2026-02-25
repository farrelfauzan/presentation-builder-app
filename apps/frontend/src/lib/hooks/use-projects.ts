'use client';

import {
  useApiQuery,
  useApiMutation,
  STALE_TIMES,
} from '@presentation-builder-app/libs';
import {
  projectApi,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from '../api';

export const projectKeys = {
  all: 'projects' as const,
  detail: (id: string): [string, string] => ['projects', id],
  presentation: (id: string): [string, string, string] => [
    'projects',
    id,
    'presentation',
  ],
};

export function useProjects() {
  return useApiQuery(projectKeys.all, () => projectApi.getAll(), {
    staleTime: STALE_TIMES.MEDIUM,
  });
}

export function useProject(id: string) {
  return useApiQuery(projectKeys.detail(id), () => projectApi.getOne(id), {
    enabled: !!id,
    staleTime: STALE_TIMES.MEDIUM,
  });
}

export function usePresentation(id: string) {
  return useApiQuery(
    projectKeys.presentation(id),
    () => projectApi.getPresentation(id),
    { enabled: !!id, staleTime: STALE_TIMES.SHORT },
  );
}

export function useCreateProject() {
  return useApiMutation(
    (data: CreateProjectPayload) => projectApi.create(data),
    { invalidateQueries: [projectKeys.all] },
  );
}

export function useUpdateProject() {
  return useApiMutation(
    ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
      projectApi.update(id, data),
    { invalidateQueries: [projectKeys.all] },
  );
}

export function useDeleteProject() {
  return useApiMutation((id: string) => projectApi.delete(id), {
    invalidateQueries: [projectKeys.all],
  });
}
