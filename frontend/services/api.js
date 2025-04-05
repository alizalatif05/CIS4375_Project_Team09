// Updated api.js with fixed endpoints
// Replace your current api.js content with this

const API_URL = 'http://localhost:3000/api';

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
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, options);

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
    // Try both endpoints since there's a discrepancy
    try {
      return await this.fetchData('/user'); // Use singular endpoint as in your backend route
    } catch (error) {
      console.log('Trying plural endpoint...');
      return await this.fetchData('/users');
    }
  },

  async getUser(id) {
    return this.fetchData(`/user/${id}`); // Changed to match your backend route
  },

  async createUser(userData) {
    return this.fetchData('/user', { // Changed to match your backend route
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id, userData) {
    return this.fetchData(`/users/${id}`, { // This one uses plural in your backend
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  async deleteUser(id) {
    return this.fetchData(`/users/${id}`, { // This one uses plural in your backend
      method: 'DELETE'
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

  async deleteTechnician(id) {
    return this.fetchData(`/technicians/${id}`, {
      method: 'DELETE'
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

  async deleteSalesRep(id) {
    return this.fetchData(`/sales_reps/${id}`, {
      method: 'DELETE'
    });
  },

  // --------- INVENTORY ---------
  async getInventory() {
    return this.fetchData('/inventory');
  },

  async addOrderItem(orderId, skuNumber) {
    return this.fetchData('/orderitems', {
      method: 'POST',
      body: JSON.stringify({
        orderID: orderId,
        skuNumber: skuNumber
      })
    });
  },

  async deleteOrderItem(orderId, skuNumber) {
    return this.fetchData(`/orderitems/${orderId}/${skuNumber}`, {
      method: 'DELETE'
    });
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
        console.log('Token saved to localStorage:', data.token.substring(0, 20) + '...');
      }
      
      return data;
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  },
  
  async adminLogin(credentials) {
    try {
      const data = await this.fetchData('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        console.log('Admin token saved to localStorage:', data.token.substring(0, 20) + '...');
      }
      
      return data;
    } catch (error) {
      throw new Error('Admin login failed: ' + error.message);
    }
  },
  
  logout() {
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  },
  
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }
};