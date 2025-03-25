<template>
  <div class="customer-page">
    <h1>Customer Management</h1>

    <div class="connection-status" v-if="connectionStatus">
      <span :class="connectionStatusClass">{{ connectionStatusMessage }}</span>
    </div>

    <div class="actions">
      <button @click="showCustomerCreateForm = true" class="create-btn">
        Add New Customer
      </button>
    </div>

    <div class="data-table">
      <h2>Customers</h2>
      <div v-if="loading.customers" class="loading">Loading customers...</div>
      <div v-else-if="error.customers" class="error-message">
        {{ error.customers }}
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Address</th>
            <th>Phone Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.CustomerID">
            <td>{{ customer.CustomerID }}</td>
            <td>{{ customer.FirstName }}</td>
            <td>{{ customer.LastName }}</td>
            <td>{{ customer.Address }}</td>
            <td>{{ customer.PhoneNumber }}</td>
            <td>
              <button @click="viewCustomerDetails(customer)" class="btn-view">
                View
              </button>
              <button @click="editCustomer(customer)" class="btn-edit">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Customer Form Modal -->
    <div v-if="showCustomerCreateForm || editingCustomer" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}</h3>
          <button @click="cancelCustomerForm" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCustomer">
            <div class="form-group">
              <label>First Name:</label>
              <input v-model="customerForm.FirstName" required />
            </div>
            <div class="form-group">
              <label>Last Name:</label>
              <input v-model="customerForm.LastName" required />
            </div>
            <div class="form-group">
              <label>Address:</label>
              <input v-model="customerForm.Address" required />
            </div>
            <div class="form-group">
              <label>Phone Number:</label>
              <input v-model="customerForm.PhoneNumber" required />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-save">Save</button>
              <button type="button" @click="cancelCustomerForm" class="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Customer Details Modal -->
    <div v-if="selectedCustomer" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Customer Details</h3>
          <button @click="selectedCustomer = null" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="details-section">
            <p><strong>ID:</strong> {{ selectedCustomer.CustomerID }}</p>
            <p><strong>First Name:</strong> {{ selectedCustomer.FirstName }}</p>
            <p><strong>Last Name:</strong> {{ selectedCustomer.LastName }}</p>
            <p><strong>Address:</strong> {{ selectedCustomer.Address }}</p>
            <p><strong>Phone Number:</strong> {{ selectedCustomer.PhoneNumber }}</p>
          </div>
          <div class="form-actions">
            <button @click="editCustomer(selectedCustomer)" class="btn-edit">Edit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/css/style.css";
import api from '../../../backend/services/api.js';

export default {
  data() {
    return {
      connectionStatus: null,

      // Loading and error states
      loading: {
        customers: false,
      },
      error: {
        customers: null,
      },

      // Customer data
      customers: [],
      selectedCustomer: null,
      editingCustomer: null,
      showCustomerCreateForm: false,
      customerForm: {
        FirstName: '',
        LastName: '',
        Address: '',
        PhoneNumber: ''
      }
    };
  },
  computed: {
    connectionStatusClass() {
      if (!this.connectionStatus) return '';
      return this.connectionStatus === 'connected' ? 'status-connected' : 'status-error';
    },
    connectionStatusMessage() {
      switch (this.connectionStatus) {
        case 'connected':
          return 'API Connected';
        case 'error':
          return 'API Connection Error';
        default:
          return '';
      }
    }
  },
  created() {
    this.checkApiConnection();
    this.loadCustomers();
  },
  methods: {
    // API connection check
    async checkApiConnection() {
      try {
        const result = await api.testConnection();
        this.connectionStatus = result.status === 'ok' ? 'connected' : 'error';

        // Auto-hide success message after 3 seconds
        if (this.connectionStatus === 'connected') {
          setTimeout(() => {
            this.connectionStatus = null;
          }, 3000);
        }
      } catch (error) {
        this.connectionStatus = 'error';
        console.error('API connection test failed:', error);
      }
    },

    // Load customer data
    async loadCustomers() {
      this.loading.customers = true;
      this.error.customers = null;

      try {
        this.customers = await api.getCustomers();
      } catch (error) {
        console.error('Error loading customers:', error);
        this.error.customers = `Failed to load customers: ${error.message}`;
      } finally {
        this.loading.customers = false;
      }
    },

    // View customer details
    viewCustomerDetails(customer) {
      this.selectedCustomer = customer;
    },

    // Edit customer
    editCustomer(customer) {
      this.editingCustomer = customer;
      this.customerForm = { ...customer };

      // If a customer was being viewed, close the view modal
      this.selectedCustomer = null;
    },

    // Save customer
    async saveCustomer() {
      try {
        if (this.editingCustomer) {
          await api.updateCustomer(this.editingCustomer.CustomerID, this.customerForm);
        } else {
          await api.createCustomer(this.customerForm);
        }

        // Refresh the customers list
        await this.loadCustomers();
        this.cancelCustomerForm();
      } catch (error) {
        console.error('Error saving customer:', error);
        alert(`Error saving customer: ${error.message}`);
      }
    },

    // Cancel customer form
    cancelCustomerForm() {
      this.editingCustomer = null;
      this.showCustomerCreateForm = false;
      this.customerForm = {
        FirstName: '',
        LastName: '',
        Address: '',
        PhoneNumber: ''
      };
    }
  }
};
</script>
