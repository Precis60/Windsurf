// Secure API Service - Enterprise Grade Security
// Replaces Firebase with secure backend API

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-secure-domain.com/api'  // Replace with your secure domain
  : 'http://localhost:3001/api';

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

      // Store secure token and user data
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));

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
      localStorage.setItem('user', JSON.stringify(this.user));

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
    localStorage.removeItem('user');
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (response.status === 401) {
        // Token expired or invalid
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Calendar/Appointment Methods
  async getAppointments() {
    return await this.secureRequest('/appointments');
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
    return await this.secureRequest('/customers');
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
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  isAuthenticated() {
    return !!(this.token && this.user);
  }

  getCurrentUser() {
    return this.user;
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
