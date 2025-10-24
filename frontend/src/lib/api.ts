import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      console.log('🔍 Fetching auth session...');

      // Get the current authenticated user
      const currentUser = await getCurrentUser();
      console.log('👤 Current user:', currentUser);

      // Get session and access token
      const session = await fetchAuthSession();
      console.log('📋 Session:', session);

      const token = session.tokens?.accessToken?.toString();
      console.log('🔑 Access token:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!token) {
        throw new Error('No access token available');
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('❌ Error getting auth headers:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Roadmap API methods
  async getRoadmaps() {
    return this.request('/api/roadmaps');
  }

  async getRoadmap(id: string) {
    return this.request(`/api/roadmaps/${id}`);
  }

  async createRoadmap(data: any) {
    return this.request('/api/roadmaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoadmap(id: string, data: any) {
    return this.request(`/api/roadmaps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoadmap(id: string) {
    return this.request(`/api/roadmaps/${id}`, {
      method: 'DELETE',
    });
  }

  async updateRoadmapStatus(id: string, status: string) {
    return this.request(`/api/roadmaps/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // User API methods
  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request('/api/users/stats');
  }

  // File API methods
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = await this.getAuthHeaders();
    delete (headers as any)['Content-Type']; // Let browser set content-type for FormData

    return this.request('/api/files/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  async uploadMultipleFiles(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const headers = await this.getAuthHeaders();
    delete (headers as any)['Content-Type'];

    return this.request('/api/files/upload-multiple', {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  async getFiles() {
    return this.request('/api/files');
  }

  async getFile(id: string) {
    return this.request(`/api/files/${id}`);
  }

  async getFileDownloadUrl(id: string) {
    return this.request(`/api/files/${id}/download`);
  }

  async deleteFile(id: string) {
    return this.request(`/api/files/${id}`, {
      method: 'DELETE',
    });
  }

  // Progress API methods
  async getProgress(roadmapId: string) {
    return this.request(`/api/progress/${roadmapId}`);
  }

  async createProgress(roadmapId: string, data: any) {
    return this.request(`/api/progress/${roadmapId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProgress(id: string, data: any) {
    return this.request(`/api/progress/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProgress(id: string) {
    return this.request(`/api/progress/${id}`, {
      method: 'DELETE',
    });
  }

  async getProgressStats(roadmapId: string) {
    return this.request(`/api/progress/stats/${roadmapId}`);
  }
}

export const apiClient = new ApiClient();
