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

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    throw new Error(await response.text());
  }

  return response.json();
};

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  // ... rest of the function
} 