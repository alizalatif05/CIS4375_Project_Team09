<template>
  <div class="order-page">
    <h1>Order Management</h1>

    <div class="connection-status" v-if="connectionStatus">
      <span :class="connectionStatusClass">{{ connectionStatusMessage }}</span>
    </div>

    <div class="actions">
      <button @click="showOrderCreateForm = true" class="create-btn">
        Add New Order
      </button>
    </div>

    <div class="data-table">
      <h2>Orders</h2>
      <div v-if="loading.orders" class="loading">Loading orders...</div>
      <div v-else-if="error.orders" class="error-message">
        {{ error.orders }}
      </div>
      <div v-else>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Sales Rep</th>
              <th>Technician</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.OrderID">
              <td>{{ order.OrderID }}</td>
              <td>{{ getCustomerName(order.CustomerID) }}</td>
              <td>{{ getSalesRepName(order.SalesRepID) }}</td>
              <td>{{ getTechnicianName(order.TechID) }}</td>
              <td>
                <button @click="toggleOrderDetails(order)" class="btn-view">
                  {{ expandedOrder === order.OrderID ? 'Hide' : 'View' }}
                </button>
                <button @click="editOrder(order)" class="btn-edit">Edit</button>
                <button @click="showAddItems(order)" class="btn-add">Add Items</button>
                <button @click="deleteOrder(order.OrderID)" class="btn-delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Expanded Order Details -->
        <div v-if="expandedOrder" class="expanded-details">
          <h3>Order Items</h3>
          <div v-if="loading.orderItems" class="loading">Loading order items...</div>
          <div v-else-if="error.orderItems" class="error-message">
            {{ error.orderItems }}
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>SKU Number</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in orderItems" :key="item.SKU_Number">
                <td>{{ item.ItemName }}</td>
                <td>{{ item.SKU_Number }}</td>
                <td>
                  <button @click="editOrderItem(item)" class="btn-edit">Edit</button>
                  <button @click="deleteOrderItem(item)" class="btn-delete">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Order Form Modal -->
    <div v-if="showOrderCreateForm || editingOrder" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingOrder ? 'Edit Order' : 'Add New Order' }}</h3>
          <button @click="cancelOrderForm" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveOrder">
            <div class="form-group">
              <label>Customer:</label>
              <select v-model="orderForm.CustomerID" required>
                <option value="">Select a Customer</option>
                <option v-for="customer in customers" :key="customer.CustomerID" :value="customer.CustomerID">
                  {{ customer.firstName }} {{ customer.lastName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Sales Rep:</label>
              <select v-model="orderForm.SalesRepID" required>
                <option value="">Select a Sales Rep</option>
                <option v-for="salesRep in salesReps" :key="salesRep.SalesRepID" :value="salesRep.SalesRepID">
                  {{ salesRep.SalesRep_fName }} {{ salesRep.SalesRep_lName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Technician:</label>
              <select v-model="orderForm.TechID" required>
                <option value="">Select a Technician</option>
                <option v-for="technician in technicians" :key="technician.TechID" :value="technician.TechID">
                  {{ technician.firstName }} {{ technician.lastName }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-save">Save</button>
              <button type="button" @click="cancelOrderForm" class="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showAddItemsModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Items to Order #{{ selectedOrder.OrderID }}</h3>
          <button @click="cancelAddItems" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Select Item:</label>
            <select v-model="selectedItem">
              <option value="">Select an Item</option>
              <option v-for="item in availableItems" :key="item.SKU_Number" :value="item.SKU_Number">
                {{ item.ItemName }} ({{ item.SKU_Number }})
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button @click="addItemToOrder" class="btn-save">Add Item</button>
            <button @click="cancelAddItems" class="btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showEditItemModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Order Item</h3>
        <button @click="cancelEditItem" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="saveEditedItem">
          <div class="form-group">
            <label>Item:</label>
            <select v-model="editItemForm.SKU_Number" required>
              <option v-for="item in availableItems"
                      :key="item.SKU_Number"
                      :value="item.SKU_Number">
                {{ item.ItemName }} ({{ item.SKU_Number }})
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-save">Save</button>
            <button type="button" @click="cancelEditItem" class="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/css/style.css";
import api from '../../services/api.js';

export default {
  data() {
    return {
      connectionStatus: null,

      // Loading and error states
      loading: {
        orders: false,
        orderItems: false,
        customers: false,
        salesReps: false,
        technicians: false,
        inventory: false
      },
      error: {
        orders: null,
        orderItems: null,
        customers: null,
        salesReps: null,
        technicians: null,
        inventory: null
      },

      // Data
      orders: [],
      orderItems: [],
      customers: [],
      salesReps: [],
      technicians: [],
      inventory: [],

      // properties for item management
      showAddItemsModal: false,
      selectedOrder: null,
      selectedItem: null,

      showEditItemModal: false,
      editItemForm: {
        OrderID: null,
        SKU_Number: null,
        originalSKU: null
      },

      // UI State
      expandedOrder: null,
      selectedOrder: null,
      editingOrder: null,
      showOrderCreateForm: false,
      orderForm: {
        CustomerID: '',
        SalesRepID: '',
        TechID: '',
        Items: []
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
    },
    availableItems() {
      return this.inventory; // Remove the filter since backend already filters
    }
  },
  created() {
    this.checkApiConnection();
    this.loadData();
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

    // Load all data
    async loadData() {
      await this.loadCustomers();
      await this.loadSalesReps();
      await this.loadTechnicians();
      await this.loadInventory();
      await this.loadOrders();
    },

    // Load orders
    async loadOrders() {
      this.loading.orders = true;
      this.error.orders = null;
      try {
        this.orders = await api.getOrders();
      } catch (error) {
        console.error('Error loading orders:', error);
        this.error.orders = `Failed to load orders: ${error.message}`;
      } finally {
        this.loading.orders = false;
      }
    },

    // Load order items
    async loadOrderItems(orderID) {
      this.loading.orderItems = true;
      this.error.orderItems = null;
      try {
        const orderDetails = await api.fetchData(`/orders/${orderID}/details`);
        // Map the response to match your frontend expectations
        this.orderItems = orderDetails.map(item => ({
          ItemName: item.ItemName,
          SKU_Number: item.SKU_Number
        }));
      } catch (error) {
        console.error('Error loading order items:', error);
        this.error.orderItems = `Failed to load order items: ${error.message}`;
      } finally {
        this.loading.orderItems = false;
      }
    },

    // Load customers
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

    // Load sales reps
    async loadSalesReps() {
      this.loading.salesReps = true;
      this.error.salesReps = null;
      try {
        this.salesReps = await api.getSalesReps();
      } catch (error) {
        console.error('Error loading sales reps:', error);
        this.error.salesReps = `Failed to load sales reps: ${error.message}`;
      } finally {
        this.loading.salesReps = false;
      }
    },

    // Load technicians
    async loadTechnicians() {
      this.loading.technicians = true;
      this.error.technicians = null;
      try {
        this.technicians = await api.getTechnicians();
      } catch (error) {
        console.error('Error loading technicians:', error);
        this.error.technicians = `Failed to load technicians: ${error.message}`;
      } finally {
        this.loading.technicians = false;
      }
    },

    // Load inventory
    async loadInventory() {
      this.loading.inventory = true;
      this.error.inventory = null;
      try {
        const response = await api.getInventory();
        console.log('Inventory response:', response); // This should work now
        if (Array.isArray(response)) {
          this.inventory = response;
        } else {
          console.error('Unexpected inventory response format:', response);
          this.error.inventory = 'Unexpected data format received from server';
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
        this.error.inventory = `Failed to load inventory: ${error.message}`;
      } finally {
        this.loading.inventory = false;
      }
    },

    // delete order item
    async deleteOrderItem(item) {
      if (confirm(`Are you sure you want to remove ${item.ItemName} from this order?`)) {
        try {
          await api.deleteOrderItem(this.expandedOrder, item.SKU_Number);
          // Refresh the order items
          await this.loadOrderItems(this.expandedOrder);
        } catch (error) {
          console.error('Error deleting order item:', error);
          alert(`Error deleting order item: ${error.message}`);
        }
      }
    },

    // Helper methods to get names
    getCustomerName(customerID) {
      const customer = this.customers.find(c => c.CustomerID === customerID);
      return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
    },

    getSalesRepName(salesRepID) {
      const salesRep = this.salesReps.find(s => s.SalesRepID === salesRepID);
      return salesRep ? `${salesRep.SalesRep_fName} ${salesRep.SalesRep_lName}` : 'Unknown';
    },

    getTechnicianName(techID) {
      const technician = this.technicians.find(t => t.TechID === techID);
      return technician ? `${technician.firstName} ${technician.lastName}` : 'Unknown';
    },

    // Toggle order details
    toggleOrderDetails(order) {
      if (this.expandedOrder === order.OrderID) {
        this.expandedOrder = null;
        this.orderItems = [];
      } else {
        this.expandedOrder = order.OrderID;
        this.loadOrderItems(order.OrderID);
      }
    },

    // edit order
    editOrderItem(item) {
      this.editItemForm = {
        OrderID: this.expandedOrder,
        SKU_Number: item.SKU_Number,
        originalSKU: item.SKU_Number
      };
      this.showEditItemModal = true;
    },

    async saveEditedItem() {
      try {
        // First delete the old item
        await api.deleteOrderItem(this.editItemForm.OrderID, this.editItemForm.originalSKU);

        // Then add the new item
        await api.addOrderItem(this.editItemForm.OrderID, this.editItemForm.SKU_Number);

        // Refresh the order items
        await this.loadOrderItems(this.expandedOrder);

        this.showEditItemModal = false;
      } catch (error) {
        console.error('Error updating order item:', error);
        alert(`Error updating order item: ${error.message}`);
      }
    },

    cancelEditItem() {
      this.showEditItemModal = false;
      this.editItemForm = {
        OrderID: null,
        SKU_Number: null,
        originalSKU: null
      };
    },

    editOrder(order) {
      this.editingOrder = order;
      this.orderForm = {
        CustomerID: order.CustomerID,
        SalesRepID: order.SalesRepID,
        TechID: order.TechID
      };
      this.showOrderCreateForm = true;
    },

    // method to show add items modal
    async showAddItems(order) {
      this.selectedOrder = order;
      try {
        if (this.inventory.length === 0) {
          await this.loadInventory();
        }
        console.log('Available items:', this.availableItems); // Check what's available
        this.showAddItemsModal = true;
        this.selectedItem = null;
      } catch (error) {
        console.error('Error preparing to add items:', error);
        this.error.inventory = 'Failed to load inventory items';
      }
    },

    // Add items to order
    async addItemsToOrder(orderID, items) {
      try {
        for (const sku of items) {
          await api.fetchData('/orderitems', {
            method: 'POST',
            body: JSON.stringify({
              skuNumber: sku,
              orderID: orderID
            })
          });
        }
      } catch (error) {
        console.error('Error adding items to order:', error);
        throw error;
      }
    },

    async addItemToOrder() {
      if (!this.selectedItem) {
        alert('Please select an item');
        return;
      }

      try {
        await api.addOrderItem(this.selectedOrder.OrderID, this.selectedItem);

        // Refresh order items display
        if (this.expandedOrder === this.selectedOrder.OrderID) {
          await this.loadOrderItems(this.selectedOrder.OrderID);
        }

        this.showAddItemsModal = false;
        this.selectedItem = null;
      } catch (error) {
        console.error('Error adding item to order:', error);
        alert(`Error adding item to order: ${error.message}`);
      }
    },

    // method to cancel add items
    cancelAddItems() {
      this.showAddItemsModal = false;
      this.selectedOrder = null;
      this.selectedItem = null;
    },

    // Save order
    async saveOrder() {
      try {
        const orderData = {
          customerID: this.orderForm.CustomerID,
          techID: this.orderForm.TechID,
          salesRepID: this.orderForm.SalesRepID
        };

        if (this.editingOrder) {
          // Update existing order
          await api.fetchData(`/orders/${this.editingOrder.OrderID}`, {
            method: 'PUT',
            body: JSON.stringify(orderData)
          });
        } else {
          // Create new order
          await api.fetchData('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
          });
        }

        await this.loadOrders();
        this.cancelOrderForm();
      } catch (error) {
        console.error('Error saving order:', error);
        alert(`Error saving order: ${error.message}`);
      }
    },

    // Delete order
    async deleteOrder(orderID) {
      if (confirm('Are you sure you want to delete this order?')) {
        try {
          await api.fetchData(`/orders/${orderID}`, {
            method: 'DELETE'
          });
          await this.loadOrders();
        } catch (error) {
          console.error('Error deleting order:', error);
          alert(`Error deleting order: ${error.message}`);
        }
      }
    },

    // Cancel order form
    cancelOrderForm() {
      this.editingOrder = null;
      this.showOrderCreateForm = false;
      this.orderForm = {
        CustomerID: '',
        SalesRepID: '',
        TechID: '',
        Items: []
      };
    }
  }
};
</script>
