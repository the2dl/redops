// Base API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiErrorData {
  message: string;
  status?: number;
}

export class ApiError extends Error {
  status?: number;
  
  constructor({ message, status }: ApiErrorData) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  console.log('Response status:', response.status); // Debug log
  console.log('Response headers:', Object.fromEntries(response.headers)); // Debug log
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An unexpected error occurred'
    }));
    console.log('Error response:', error); // Debug log
    
    throw new ApiError({
      message: error.message || `HTTP error! status: ${response.status}`,
      status: response.status
    });
  }
  
  const data = await response.json();
  console.log('Response data:', data); // Debug log
  return data;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  }

  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  // ... rest of the function
} 