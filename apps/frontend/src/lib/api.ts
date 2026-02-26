import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to unwrap { data: ... } envelope
apiClient.interceptors.response.use(
  (response) => {
    // The backend wraps everything in { data: ... }
    if (response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ─── Project API ────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string | null;
  version: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  slides?: Slide[];
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  version?: string;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  version?: string;
}

export const projectApi = {
  getAll: () => apiClient.get<Project[]>('/projects').then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),

  getPresentation: (id: string) =>
    apiClient.get<Project>(`/projects/${id}/presentation`).then((r) => r.data),

  create: (data: CreateProjectPayload) =>
    apiClient.post<Project>('/projects', data).then((r) => r.data),

  update: (id: string, data: UpdateProjectPayload) =>
    apiClient.put<Project>(`/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};

// ─── Slide API ──────────────────────────────────────────

export interface Slide {
  id: string;
  projectId: string;
  order: number;
  textContent: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateSlidePayload {
  order?: number;
  textContent?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface UpdateSlidePayload {
  order?: number;
  textContent?: string | null;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
}

export interface ReorderSlidesPayload {
  slideIds: string[];
}

export const slideApi = {
  getAll: (projectId: string) =>
    apiClient.get<Slide[]>(`/slides/project/${projectId}`).then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<Slide>(`/slides/${id}`).then((r) => r.data),

  create: (projectId: string, data: CreateSlidePayload) =>
    apiClient
      .post<Slide>(`/slides/project/${projectId}`, data)
      .then((r) => r.data),

  update: (id: string, data: UpdateSlidePayload) =>
    apiClient.put<Slide>(`/slides/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/slides/${id}`),

  reorder: (projectId: string, data: ReorderSlidesPayload) =>
    apiClient
      .patch<Slide[]>(`/slides/project/${projectId}/reorder`, data)
      .then((r) => r.data),
};

// ─── Global Settings API ────────────────────────────────

export interface GlobalSettings {
  id: string;
  companyName: string | null;
  logoUrl: string | null;
  address: string | null;
  email: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const settingsApi = {
  get: () =>
    apiClient.get<GlobalSettings>('/global-settings').then((r) => r.data),

  create: (formData: FormData) =>
    apiClient
      .post<GlobalSettings>('/global-settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  update: (formData: FormData) =>
    apiClient
      .patch<GlobalSettings>('/global-settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
};

// ─── Upload API ─────────────────────────────────────────

export interface UploadResponse {
  url: string;
  mediaType?: string;
}

export interface PresignResponse {
  presignedUrl: string;
  publicUrl: string;
  mediaType: 'image' | 'video' | null;
}

export const uploadApi = {
  /** Buffered upload through backend → MinIO (works reliably, supports progress). */
  upload: (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<UploadResponse>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (e) => {
              if (e.total) {
                onProgress(Math.round((e.loaded / e.total) * 100));
              }
            }
          : undefined,
      })
      .then((r) => r.data);
  },

  /**
   * Fast direct upload:
   * 1. Ask the backend for a presigned MinIO PUT URL.
   * 2. PUT the file straight to MinIO from the browser — no backend buffering.
   */
  presignAndUpload: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResponse> => {
    // Step 1 – get presigned URL
    const { presignedUrl, publicUrl, mediaType } = await apiClient
      .post<PresignResponse>('/upload/presign', {
        filename: file.name,
        contentType: file.type,
      })
      .then((r) => r.data);

    // Step 2 – upload directly to MinIO with XHR so we can track progress
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`MinIO upload failed: ${xhr.status}`));
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });

    return { url: publicUrl, mediaType: mediaType ?? undefined };
  },
};
