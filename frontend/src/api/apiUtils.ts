const API_BASE_URL = 'http://localhost:8081/api';

// Helper function to get JWT token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Centralized fetch function with authentication
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(`Request failed: ${response.status}`);
  }

  return response;
};

// Helper for GET requests
export const apiGet = async (endpoint: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`);
  return response.json();
};

// Helper for GET requests that return plain text (like CSV)
export const apiGetText = async (endpoint: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`);
  return response.text();
};

// Helper for POST requests
export const apiPost = async (endpoint: string, data: any) => {
  const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Helper for PUT requests
export const apiPut = async (endpoint: string, data: any) => {
  const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Helper for DELETE requests
export const apiDelete = async (endpoint: string) => {
  const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
  });
  return response;
}; 