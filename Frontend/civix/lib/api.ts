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

async function fetchApiBlob(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let message = 'An error occurred';
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        message = data.message || message;
      } else {
        const text = await response.text();
        if (text) message = text;
      }

      throw new ApiError(response.status, message);
    }

    return response.blob();
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
  // Create a new poll (Officials only)
  create: async (pollData: {
    title: string;
    description?: string;
    options: string[];
    targetLocation: string;
    expiresAt?: string;
  }) => {
    return fetchApi('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  },

  // Get all polls (filtered by user location)
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
    location?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', String(filters.page));
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.location) queryParams.append('location', filters.location);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/polls?${queryString}` : '/polls';

    return fetchApi(endpoint, {
      method: 'GET',
    });
  },

  // Get poll by ID with vote statistics
  getById: async (id: string) => {
    return fetchApi(`/polls/${id}`, {
      method: 'GET',
    });
  },

  // Vote on a poll (Citizens only)
  vote: async (id: string, selectedOption: string) => {
    return fetchApi(`/polls/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ selectedOption }),
    });
  },

  // Get detailed poll statistics
  getStats: async (id: string) => {
    return fetchApi(`/polls/${id}/stats`, {
      method: 'GET',
    });
  },

  // Close a poll (Officials only)
  close: async (id: string) => {
    return fetchApi(`/polls/${id}/close`, {
      method: 'PATCH',
    });
  },

  // Get polls created by current official
  getMyPolls: async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', String(filters.page));
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    if (filters?.status) queryParams.append('status', filters.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/polls/my-polls?${queryString}` : '/polls/my-polls';

    return fetchApi(endpoint, {
      method: 'GET',
    });
  },
};

// Governance API (Officials only)
export const governanceApi = {
  getPetitions: async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', String(filters.page));
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/governance/petitions?${queryString}` : '/governance/petitions';

    return fetchApi(endpoint, { method: 'GET' });
  },

  getStats: async () => {
    return fetchApi('/governance/stats', { method: 'GET' });
  },

  respondToPetition: async (
    id: string,
    payload: { response: string; status: 'under_review' | 'closed' }
  ) => {
    return fetchApi(`/governance/petitions/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updatePetitionStatus: async (id: string, status: 'active' | 'under_review' | 'closed') => {
    return fetchApi(`/governance/petitions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Reports API (Officials only)
export const reportApi = {
  getReports: async (filters?: {
    startDate?: string;
    endDate?: string;
    location?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.location) queryParams.append('location', filters.location);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reports?${queryString}` : '/reports';

    return fetchApi(endpoint, { method: 'GET' });
  },

  exportCsv: async (filters?: {
    type?: 'petitions' | 'polls' | 'signatures' | 'votes' | 'audit';
    startDate?: string;
    endDate?: string;
    location?: string;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('type', filters?.type || 'petitions');
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.location) queryParams.append('location', filters.location);

    return fetchApiBlob(`/reports/export?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'text/csv',
      },
    });
  },

  exportPdf: async (filters?: {
    type?: 'petitions' | 'polls' | 'signatures' | 'votes' | 'audit';
    startDate?: string;
    endDate?: string;
    location?: string;
  }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('type', filters?.type || 'petitions');
    queryParams.append('format', 'pdf');
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.location) queryParams.append('location', filters.location);

    return fetchApiBlob(`/reports/export?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
    });
  },
};
