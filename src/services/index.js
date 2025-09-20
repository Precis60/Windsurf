import apiService from './api.js';

// Authentication service
export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      
      if (response.token) {
        apiService.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      if (response.token) {
        apiService.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Logout user
  async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.clearAuth();
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      return await apiService.get('/auth/profile');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiService.getToken();
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Customer service
export const customerService = {
  // Get all customers (admin/staff only)
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/customers?${queryString}`);
  },

  // Get single customer
  async getCustomer(id) {
    return await apiService.get(`/customers/${id}`);
  },

  // Update customer
  async updateCustomer(id, customerData) {
    return await apiService.put(`/customers/${id}`, customerData);
  },

  // Delete customer (admin only)
  async deleteCustomer(id) {
    return await apiService.delete(`/customers/${id}`);
  }
};

// Appointment service
export const appointmentService = {
  // Get all appointments
  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/appointments?${queryString}`);
  },

  // Create new appointment
  async createAppointment(appointmentData) {
    return await apiService.post('/appointments', appointmentData);
  },

  // Get single appointment
  async getAppointment(id) {
    return await apiService.get(`/appointments/${id}`);
  },

  // Update appointment
  async updateAppointment(id, appointmentData) {
    return await apiService.put(`/appointments/${id}`, appointmentData);
  },

  // Delete appointment
  async deleteAppointment(id) {
    return await apiService.delete(`/appointments/${id}`);
  }
};

// Project service
export const projectService = {
  // Get all projects
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/projects?${queryString}`);
  },

  // Create new project (staff/admin only)
  async createProject(projectData) {
    return await apiService.post('/projects', projectData);
  },

  // Get single project
  async getProject(id) {
    return await apiService.get(`/projects/${id}`);
  },

  // Update project
  async updateProject(id, projectData) {
    return await apiService.put(`/projects/${id}`, projectData);
  },

  // Delete project (admin only)
  async deleteProject(id) {
    return await apiService.delete(`/projects/${id}`);
  }
};

// Support service
export const supportService = {
  // Get all support tickets
  async getTickets(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/support?${queryString}`);
  },

  // Create new support ticket
  async createTicket(ticketData) {
    return await apiService.post('/support', ticketData);
  },

  // Get single support ticket
  async getTicket(id) {
    return await apiService.get(`/support/${id}`);
  },

  // Add response to support ticket
  async addResponse(id, message) {
    return await apiService.post(`/support/${id}/responses`, { message });
  },

  // Update support ticket (staff/admin only)
  async updateTicket(id, ticketData) {
    return await apiService.put(`/support/${id}`, ticketData);
  }
};
