// Secure API Service - Enterprise Grade Security
// Production backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://precision-cabling-backend.onrender.com/api';

class SecureApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = this.getStoredUser();
  }

  // Authentication Methods
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      this.token = data.token;
      this.user = data.user;
      
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('authUser', JSON.stringify(this.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      // Store secure token and user data
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('authUser', JSON.stringify(this.user));

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  // Secure API Request Method
  async secureRequest(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('Authentication required');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Request config:', config);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      console.log('API response status:', response.status);
      console.log('API response headers:', [...response.headers.entries()]);
      const data = await response.json();
      console.log('API response data:', data);

      if (response.status === 401) {
        // Token expired or invalid
        this.logout();
        const err = new Error('Session expired. Please login again.');
        err.status = 401;
        err.data = data;
        throw err;
      }

      if (!response.ok) {
        const err = new Error(data.error?.message || 'Request failed');
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Calendar/Appointment Methods
  async getAppointments() {
    return await this.secureRequest('/appointments?limit=100');
  }

  async createAppointment(appointmentData) {
    return await this.secureRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id, appointmentData) {
    return await this.secureRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id) {
    return await this.secureRequest(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Customer/CRM Methods
  async getCustomers() {
    return await this.secureRequest('/customers?limit=1000');
  }

  async createCustomer(customerData) {
    return await this.secureRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id, customerData) {
    return await this.secureRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id) {
    return await this.secureRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Project Methods
  async getProjects() {
    return await this.secureRequest('/projects');
  }

  async createProject(projectData) {
    return await this.secureRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return await this.secureRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  // Support Methods
  async getSupportTickets() {
    return await this.secureRequest('/support');
  }

  async createSupportTicket(ticketData) {
    return await this.secureRequest('/support', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  // Utility Methods
  getStoredUser() {
    try {
      const userData = localStorage.getItem('authUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  isAuthenticated() {
    // Always refresh from localStorage to ensure we have the latest state
    this.token = localStorage.getItem('authToken');
    this.user = this.getStoredUser();
    
    const hasToken = !!this.token;
    const hasUser = !!this.user;
    const isAuth = hasToken && hasUser;
    console.log('isAuthenticated check - token:', hasToken, 'user:', hasUser, 'result:', isAuth);
    
    if (!isAuth) {
      // Clear any partial state if not fully authenticated
      this.logout();
    }
    
    return isAuth;
  }

  getCurrentUser() {
    return this.user;
  }

  isAdmin() {
    if (!this.user) {
      this.user = this.getStoredUser();
    }
    // Check for the 'admin' role provided by the backend.
    return this.user && this.user.role === 'admin';
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const secureApi = new SecureApiService();

export default secureApi;

// Export individual services for convenience
export const authService = {
  login: (email, password) => secureApi.login(email, password),
  register: (userData) => secureApi.register(userData),
  logout: () => secureApi.logout(),
  isAuthenticated: () => secureApi.isAuthenticated(),
  getCurrentUser: () => secureApi.getCurrentUser(),
  isAdmin: () => secureApi.isAdmin(),
};

export const appointmentsService = {
  getAll: () => secureApi.getAppointments(),
  create: (data) => secureApi.createAppointment(data),
  update: (id, data) => secureApi.updateAppointment(id, data),
  delete: (id) => secureApi.deleteAppointment(id),
};

export const customersService = {
  getAll: () => secureApi.getCustomers(),
  create: (data) => secureApi.createCustomer(data),
  update: (id, data) => secureApi.updateCustomer(id, data),
  delete: (id) => secureApi.deleteCustomer(id),
};

export const projectsService = {
  getAll: () => secureApi.getProjects(),
  create: (data) => secureApi.createProject(data),
  update: (id, data) => secureApi.updateProject(id, data),
};

export const supportService = {
  getTickets: () => secureApi.getSupportTickets(),
  createTicket: (data) => secureApi.createSupportTicket(data),
};

// Calendar helper services
export const calendarService = {
  getCalendarCustomers: async (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return await secureApi.secureRequest(`/calendar/customers${params}`);
  },
};

// Appointment Requests
export const appointmentRequestService = {
  getAll: async (params = '') => {
    const qs = typeof params === 'string' && params ? params : '';
    return await secureApi.secureRequest(`/appointment-requests${qs}`);
  },
  create: async (data) => {
    return await secureApi.secureRequest('/appointment-requests', { method: 'POST', body: data });
  },
  update: async (id, data) => {
    return await secureApi.secureRequest(`/appointment-requests/${id}`, { method: 'PUT', body: data });
  },
};
