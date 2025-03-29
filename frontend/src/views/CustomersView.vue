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
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.CustomerID">
            <td>{{ customer.CustomerID }}</td>
            <td>{{ customer.firstName }}</td>
            <td>{{ customer.lastName }}</td>
            <td>{{ customer.address }}</td>
            <td>{{ customer.phone }}</td>
            <td>
              <button @click="viewCustomerDetails(customer)" class="btn-view">
                View
              </button>
              <button @click="editCustomer(customer)" class="btn-edit">
                Edit
              </button>
              <button @click="deleteCustomer(customer.CustomerID)" class="btn-delete">
                Delete
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
              <input v-model="customerForm.Customer_fName" type="text" required />
            </div>
            <div class="form-group">
              <label>Last Name:</label>
              <input v-model="customerForm.Customer_lName" type="text" required />
            </div>
            <div class="form-group">
              <label>Address:</label>
              <input v-model="customerForm.CustomerAddress" type="text" required />
            </div>
            <div class="form-group">
              <label>Phone:</label>
              <input v-model="customerForm.CustomerPhone" type="text" required />
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
            <p><strong>First Name:</strong> {{ selectedCustomer.firstName }}</p>
            <p><strong>Last Name:</strong> {{ selectedCustomer.lastName }}</p>
            <p><strong>Address:</strong> {{ selectedCustomer.address }}</p>
            <p><strong>Phone:</strong> {{ selectedCustomer.phone }}</p>
          </div>
          <div class="form-actions">
            <button @click="editCustomer(selectedCustomer)" class="btn-edit">Edit</button>
            <button @click="selectedCustomer = null" class="btn-cancel">Close</button>
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
        Customer_fName: '',
        Customer_lName: '',
        CustomerAddress: '',
        CustomerPhone: ''
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
      this.customerForm = {
        Customer_fName: customer.firstName,  // Maps from API response to form field
        Customer_lName: customer.lastName,
        CustomerAddress: customer.address,
        CustomerPhone: customer.phone
      };
      this.showCustomerCreateForm = true;
      this.selectedCustomer = null;
    },

    // Save customer
    async saveCustomer() {
      try {
        const customerData = {
          firstName: this.customerForm.Customer_fName,
          lastName: this.customerForm.Customer_lName,
          address: this.customerForm.CustomerAddress,
          phone: this.customerForm.CustomerPhone
        };

        if (this.editingCustomer) {
          await api.fetchData(`/customers/${this.editingCustomer.CustomerID}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
          });
        } else {
          await api.fetchData('/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
          });
        }
        await this.loadCustomers();
        this.cancelCustomerForm();
      } catch (error) {
        console.error('Error saving customer:', error);
        alert(`Error saving customer: ${error.message}`);
      }
    },

    // Delete customer
    async deleteCustomer(customerID) {
      if (confirm('Are you sure you want to delete this customer?')) {
        try {
          await api.fetchData(`/customers/${customerID}`, {
            method: 'DELETE'
          });
          await this.loadCustomers();
        } catch (error) {
          console.error('Error deleting customer:', error);
          alert(`Error deleting customer: ${error.message}`);
        }
      }
    },

    // Cancel customer form
    cancelCustomerForm() {
      this.editingCustomer = null;
      this.showCustomerCreateForm = false;
      this.customerForm = {
        firstName: '',
        lastName: '',
        address: '',
        phone: ''
      };
    }
  }
};
</script>
