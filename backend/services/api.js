// services/api.js
// Simplified API service with essential functionality

const API_URL = 'http://localhost:3000/api';
console.log = API_URL;
/**
 * Basic API service with simplified error handling
 * Focuses on core CRUD operations for main entities
 */
export default {
  // Helper for managing auth tokens
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  // Basic fetch wrapper with error handling
  async fetchData(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    // Add authorization header if token exists
    if (!options.headers) {
      options.headers = {};
    }
    
    options.headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers
    };
    
    try {
      const response = await fetch(url, options);
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },
  
  // Test connection to the API
  async testConnection() {
    try {
      return await this.fetchData('/status');
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },
  
  // ========== CORE ENTITY OPERATIONS ==========
  
  // --------- USERS ---------
  async getUsers() {
    return this.fetchData('/users');
  },
  
  async getUser(id) {
    return this.fetchData(`/users/${id}`);
  },
  
  async createUser(userData) {
    return this.fetchData('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  async updateUser(id, userData) {
    return this.fetchData(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },
  
  // --------- TECHNICIANS ---------
  async getTechnicians() {
    return this.fetchData('/technicians');
  },
  
  async getTechnician(id) {
    return this.fetchData(`/technicians/${id}`);
  },
  
  async createTechnician(techData) {
    return this.fetchData('/technicians', {
      method: 'POST',
      body: JSON.stringify(techData)
    });
  },
  
  async updateTechnician(id, techData) {
    return this.fetchData(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(techData)
    });
  },
  
  // --------- SALES REPS ---------
  async getSalesReps() {
    return this.fetchData('/sales_reps');
  },
  
  async getSalesRep(id) {
    return this.fetchData(`/sales_reps/${id}`);
  },
  
  async createSalesRep(repData) {
    return this.fetchData('/sales_reps', {
      method: 'POST',
      body: JSON.stringify(repData)
    });
  },
  
  async updateSalesRep(id, repData) {
    return this.fetchData(`/sales_reps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(repData)
    });
  },
  
  // --------- INVENTORY ---------
  async getInventory() {
    return this.fetchData('/inventory');
  },
  
  async getInventoryItem(sku) {
    return this.fetchData(`/inventory/${sku}`);
  },
  
  // --------- ORDERS ---------
  async getOrders() {
    return this.fetchData('/orders');
  },
  
  async getOrder(id) {
    return this.fetchData(`/orders/${id}`);
  },
  
  // --------- CUSTOMERS ---------
  async getCustomers() {
    return this.fetchData('/customers');
  },
  
  async getCustomer(id) {
    return this.fetchData(`/customers/${id}`);
  },
  
  // --------- AUTHENTICATION ---------
  async login(credentials) {
    try {
      const data = await this.fetchData('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return data;
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  },
  
  logout() {
    localStorage.removeItem('token');
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};