// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Token management
const TOKEN_KEY = 'civix_token';

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};

// API Client utility
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = tokenManager.getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for JWT
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error. Please check your connection.');
  }
}

// Auth API
export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    location: string;
  }) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return fetchApi('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async () => {
    return fetchApi('/auth/me', {
      method: 'GET',
    });
  },
};

// Petition API
export const petitionApi = {
  create: async (petitionData: {
    title: string;
    description: string;
    category: string;
    location: string;
  }) => {
    return fetchApi('/petitions', {
      method: 'POST',
      body: JSON.stringify(petitionData),
    });
  },

  getAll: async (filters?: {
    location?: string;
    category?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/petitions?${queryString}` : '/petitions';
    
    return fetchApi(endpoint, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return fetchApi(`/petitions/${id}`, {
      method: 'GET',
    });
  },

  sign: async (id: string) => {
    return fetchApi(`/petitions/${id}/sign`, {
      method: 'POST',
    });
  },

  // Official-only: update petition status
  updateStatus: async (id: string, status: string) => {
    return fetchApi(`/petitions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Citizen-only: get current user's created petitions
  getMine: async () => {
    return fetchApi('/petitions/user/mine', {
      method: 'GET',
    });
  },

  getStats: async () => {
    return fetchApi('/petitions/stats', {
      method: 'GET',
    });
  },
};

// Poll API
export const pollApi = {
  getAll: async (filters?: { location?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters?.location) queryParams.append('location', filters.location);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/polls?${queryString}` : '/polls';
    return fetchApi(endpoint, { method: 'GET' });
  },

  create: async (pollData: {
    title: string;
    options: string[];
    targetLocation: string;
  }) => {
    return fetchApi('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  },

  getById: async (id: string) => {
    return fetchApi(`/polls/${id}`, { method: 'GET' });
  },

  vote: async (id: string, option: string) => {
    return fetchApi(`/polls/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option }),
    });
  },
};
