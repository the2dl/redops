import { apiRequest } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('token', response.token);
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkSetup(): Promise<{ setupRequired: boolean }> {
    return apiRequest<{ setupRequired: boolean }>('/auth/setup-required');
  },

  async setupAdmin(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },

  async loginWithAzure(): Promise<void> {
    window.location.href = '/api/auth/azure';
  },

  async handleAuthCallback(token: string): Promise<AuthResponse> {
    localStorage.setItem('token', token);
    const user = await this.getCurrentUser();
    return { token, user };
  },

  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/auth/me');
  }
}; 