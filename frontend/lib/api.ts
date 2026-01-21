import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Character Profiles API
export const characterProfilesApi = {
  getAll: () => api.get('/api/character-profiles'),
  getById: (id: string) => api.get(`/api/character-profiles/${id}`),
  create: (data: any) => api.post('/api/character-profiles', data),
  update: (id: string, data: any) => api.patch(`/api/character-profiles/${id}`, data),
  delete: (id: string) => api.delete(`/api/character-profiles/${id}`),
};

// Text Templates API
export const textTemplatesApi = {
  getAll: () => api.get('/api/text-templates'),
  getById: (id: string) => api.get(`/api/text-templates/${id}`),
  create: (data: any) => api.post('/api/text-templates', data),
  update: (id: string, data: any) => api.patch(`/api/text-templates/${id}`, data),
  delete: (id: string) => api.delete(`/api/text-templates/${id}`),
};

// Video Generation API
export const videoGenerationApi = {
  generate: (data: {
    character_profile_id: string;
    text_template_id: string;
    options?: {
      duration?: 5 | 10;
      aspectRatio?: '9:16' | '16:9' | '1:1';
      guidanceScale?: number;
    };
  }) => api.post('/api/generate', data),
  getAll: (status?: string) => {
    const params = status ? { status } : {};
    return api.get('/api/generated-videos', { params });
  },
  getById: (id: string) => api.get(`/api/generated-videos/${id}`),
  download: (id: string) => api.get(`/api/generated-videos/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/api/generated-videos/${id}`),
};

export default api;
