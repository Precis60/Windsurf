// Secure API Service - Enterprise Grade Security
// Replaces Firebase with secure backend API

// Always use the production backend URL to ensure connectivity during development
const API_BASE_URL = 'https://precision-cabling-backend.onrender.com/api';

// Demo mode flag - set to false to use real backend API
const DEMO_MODE = false;

class SecureApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = this.getStoredUser();
  }

  // Authentication Methods
  async login(email, password) {
    if (DEMO_MODE) {
      // Demo mode - simulate login
      if (email === 'admin@precisioncabling.com' && password === 'Admin123!') {
        const demoUser = {
          id: 1,
          email: 'admin@precisioncabling.com',
          firstName: 'Demo',
          lastName: 'Admin',
          role: 'admin'
        };
        const demoToken = 'demo-token-' + Date.now();
        
        this.token = demoToken;
        this.user = demoUser;
        
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('authUser', JSON.stringify(this.user));
        
        return {
          token: demoToken,
          user: demoUser,
          message: 'Login successful (Demo Mode)'
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }
    
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
    if (DEMO_MODE) {
      // Demo mode - get appointments from localStorage
      const appointments = JSON.parse(localStorage.getItem('demo_appointments') || '[]');
      
      // Add some default demo appointments if none exist
      if (appointments.length === 0) {
        const defaultAppointments = [
          {
            id: 1,
            title: 'Client Site Survey',
            description: 'Initial site assessment for network infrastructure',
            appointmentDate: '2025-01-20T10:00:00.000Z',
            durationMinutes: 120,
            status: 'scheduled',
            createdAt: '2025-01-15T10:00:00.000Z'
          },
          {
            id: 2,
            title: 'Network Infrastructure Install',
            description: 'Complete network setup and configuration',
            appointmentDate: '2025-01-25T09:00:00.000Z',
            durationMinutes: 480,
            status: 'scheduled',
            createdAt: '2025-01-15T14:30:00.000Z'
          }
        ];
        localStorage.setItem('demo_appointments', JSON.stringify(defaultAppointments));
        return { appointments: defaultAppointments };
      }
      
      return { appointments };
    }
    
    return await this.secureRequest('/appointments');
  }

  async createAppointment(appointmentData) {
    if (DEMO_MODE) {
      // Demo mode - simulate appointment creation with localStorage
      const appointments = JSON.parse(localStorage.getItem('demo_appointments') || '[]');
      const newAppointment = {
        id: Date.now(),
        ...appointmentData,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      appointments.push(newAppointment);
      localStorage.setItem('demo_appointments', JSON.stringify(appointments));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        message: 'Appointment created successfully (Demo Mode)',
        appointment: newAppointment
      };
    }
    
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
    if (DEMO_MODE) {
      // Demo mode - get customers from localStorage
      const customers = JSON.parse(localStorage.getItem('demo_customers') || '[]');
      
      // Add some default demo customers if none exist
      if (customers.length === 0) {
        const defaultCustomers = [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@abcmfg.com',
            phone: '(555) 123-4567',
            company: 'ABC Manufacturing Corp',
            address: '123 Industrial Blvd, Manufacturing District, CA 90210',
            createdAt: '2025-01-15T10:00:00.000Z'
          },
          {
            id: 2,
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@officecomplex.com',
            phone: '(555) 987-6543',
            company: 'Office Complex LLC',
            address: '456 Business Park Dr, Suite 200, Business District, CA 90211',
            createdAt: '2025-01-10T14:30:00.000Z'
          }
        ];
        localStorage.setItem('demo_customers', JSON.stringify(defaultCustomers));
        return { customers: defaultCustomers };
      }
      
      return { customers };
    }
    
    return await this.secureRequest('/customers');
  }

  async createCustomer(customerData) {
    if (DEMO_MODE) {
      // Demo mode - simulate customer creation with localStorage
      const customers = JSON.parse(localStorage.getItem('demo_customers') || '[]');
      const newCustomer = {
        id: Date.now(),
        ...customerData,
        createdAt: new Date().toISOString()
      };
      customers.push(newCustomer);
      localStorage.setItem('demo_customers', JSON.stringify(customers));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        message: 'Customer created successfully (Demo Mode)',
        customer: newCustomer
      };
    }
    
    return await this.secureRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id, customerData) {
    if (DEMO_MODE) {
      // Demo mode - simulate customer update with localStorage
      const customers = JSON.parse(localStorage.getItem('demo_customers') || '[]');
      const customerIndex = customers.findIndex(customer => customer.id === id);
      
      if (customerIndex === -1) {
        throw new Error('Customer not found');
      }
      
      // Update the customer while preserving id and createdAt
      customers[customerIndex] = {
        ...customers[customerIndex],
        ...customerData,
        id: id, // Preserve original ID
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('demo_customers', JSON.stringify(customers));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        message: 'Customer updated successfully (Demo Mode)',
        customer: customers[customerIndex]
      };
    }
    
    return await this.secureRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id) {
    if (DEMO_MODE) {
      // Demo mode - simulate customer deletion with localStorage
      const customers = JSON.parse(localStorage.getItem('demo_customers') || '[]');
      const customerIndex = customers.findIndex(customer => customer.id === id);
      
      if (customerIndex === -1) {
        throw new Error('Customer not found');
      }
      
      // Remove the customer
      customers.splice(customerIndex, 1);
      localStorage.setItem('demo_customers', JSON.stringify(customers));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        message: 'Customer deleted successfully (Demo Mode)'
      };
    }
    
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
    // Refresh token and user from localStorage if not already loaded
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    if (!this.user) {
      this.user = this.getStoredUser();
    }
    
    const hasToken = !!this.token;
    const hasUser = !!this.user;
    const isAuth = hasToken && hasUser;
    console.log('isAuthenticated check - token:', hasToken, 'user:', hasUser, 'result:', isAuth);
    
    // For development, if no auth is found, create demo auth
    if (!isAuth && process.env.NODE_ENV !== 'production') {
      console.log('Creating demo authentication for development...');
      this.token = 'demo-token-' + Date.now();
      this.user = {
        id: 1,
        email: 'admin@precisioncabling.com',
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'admin'
      };
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('authUser', JSON.stringify(this.user));
      return true;
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
