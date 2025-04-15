<template>
  <div class="order-page">
    <h1>Order Management</h1>

    <div class="connection-status" v-if="connectionStatus">
      <span :class="connectionStatusClass">{{ connectionStatusMessage }}</span>
    </div>

    <!-- Order creation button -->
    <div class="actions">
      <button @click="showOrderCreateForm = true" class="create-btn">
        Add New Order
      </button>
    </div>
    <div class="date-filters">
  <h3>Filter Orders by Date</h3>
  <div class="filter-controls">
    <div class="form-group">
      <label>Filter by:</label>
      <select v-model="dateFilters.filterBy">
        <option value="created">Date Created</option>
        <option value="assigned">Date Assigned</option>
        <option value="completed">Date Completed</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>Start Date:</label>
      <input type="date" v-model="dateFilters.startDate">
    </div>
    
    <div class="form-group">
      <label>End Date:</label>
      <input type="date" v-model="dateFilters.endDate">
    </div>
    
    <button @click="resetDateFilters" class="btn-reset">Reset Filters</button>
  </div>
</div>

    <!-- Main orders table -->
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
              <th>Date Created</th>
              <th>Date Assigned</th>
              <th>Date Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.OrderID">
              <td>{{ order.OrderID }}</td>
              <td>{{ getCustomerName(order.CustomerID) }}</td>
              <td>{{ getSalesRepName(order.SalesRepID) }}</td>
              <td>{{ getTechnicianName(order.TechID) }}</td>
              <td>{{ formatDate(order.DateCreated) }}</td>
              <td>{{ formatDate(order.DateAssigned) }}</td>
              <td>{{ formatDate(order.DateCompleted) }}</td>
              <td>
                <button @click="viewOrderDetails(order)" class="btn-view">
                 View
                </button>
                <button @click="editOrder(order)" class="btn-edit">Edit</button>
                <button @click="showAddItems(order)" class="btn-add">Add Items</button>
                <button v-if="!order.DateCompleted" @click="completeOrder(order.OrderID)" class="btn-complete">Complete</button>
                <button @click="deleteOrder(order.OrderID)" class="btn-delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Order details modal -->
      <div v-if="showOrderDetailsModal" class="modal">
        <div class="modal-content order-details-modal">
          <div class="modal-header">
            <h3>Order #{{ selectedOrder.OrderID }} Details</h3>
            <button @click="closeOrderDetails" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="order-summary">
              <div class="summary-row">
                <div class="summary-item">
                  <strong>Customer:</strong> {{ getCustomerName(selectedOrder.CustomerID) }}
                </div>
                <div class="summary-item">
                  <strong>Sales Rep:</strong> {{ getSalesRepName(selectedOrder.SalesRepID) }}
                </div>
                <div class="summary-item">
                  <strong>Technician:</strong> {{ getTechnicianName(selectedOrder.TechID) }}
                </div>
              </div>
              <div class="summary-row">
                <div class="summary-item">
                  <strong>Created:</strong> {{ formatDate(selectedOrder.DateCreated) }}
                </div>
                <div class="summary-item">
                  <strong>Assigned:</strong> {{ formatDate(selectedOrder.DateAssigned) }}
                </div>
                <div class="summary-item">
                  <strong>Completed:</strong> {{ formatDate(selectedOrder.DateCompleted) }}
                </div>
              </div>
            </div>
            
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
                  <th>Quantity</th>
                  <th>Date Added</th>
                  <th>Date Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orderItems" :key="item.SKU_Number">
                  <td>{{ item.ItemName }}</td>
                  <td>{{ item.SKU_Number }}</td>
                  <td>{{ item.QTY }}</td>
                  <td>{{ formatDate(item.DateAdded) }}</td>
                  <td>{{ formatDate(item.DateUsed) }}</td>
                  <td>
                    <button @click="editOrderItem(item)" class="btn-edit">Edit</button>
                    <button v-if="!item.DateUsed" @click="markItemAsUsed(item)" class="btn-used">Mark Used</button>
                    <button @click="deleteOrderItem(item)" class="btn-delete">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="modal-actions">
              <button @click="showAddItems(selectedOrder)" class="btn-add">Add Items</button>
              <button v-if="!selectedOrder.DateCompleted" @click="completeOrder(selectedOrder.OrderID)" class="btn-complete">Complete Order</button>
              <button @click="closeOrderDetails" class="btn-cancel">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order create/edit modal -->
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

    <!-- Add items modal -->
    <div v-if="showAddItemsModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Items to Order #{{ selectedOrder.OrderID }}</h3>
          <button @click="cancelAddItems" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="item-selection-area">
            <div class="form-group">
              <label>Select Item:</label>
              <select v-model="itemToAdd.SKU_Number">
                <option value="">Select an Item</option>
                <option v-for="item in availableItems" :key="item.SKU_Number" :value="item.SKU_Number">
                  {{ item.ItemName }} ({{ item.SKU_Number }}) - Available: {{ item.Item_Quantity }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                v-model.number="itemToAdd.QTY"
                min="1"
                :max="getMaxQuantity()"
                :disabled="!itemToAdd.SKU_Number"
              />
            </div>
            <button
              @click="addToItemsList"
              class="btn-add-item"
              :disabled="!itemToAdd.SKU_Number || itemToAdd.QTY < 1"
            >
              Add to List
            </button>
          </div>
          <!-- Selected items list -->
          <div class="selected-items-list" v-if="selectedItems.length > 0">
            <h4>Items to Add:</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in selectedItems" :key="index">
                  <td>{{ getItemName(item.SKU_Number) }}</td>
                  <td>{{ item.QTY }}</td>
                  <td>
                    <button @click="removeItemFromList(index)" class="btn-remove">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="form-actions">
            <button
              @click="addItemsToOrder"
              class="btn-save"
              :disabled="selectedItems.length === 0"
            >
              Add Items to Order
            </button>
            <button @click="cancelAddItems" class="btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit item modal -->
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
            <div class="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                v-model.number="editItemForm.QTY"
                min="1"
                :max="getMaxQuantityForEdit()"
                required
              />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-save">Save</button>
              <button type="button" @click="cancelEditItem" class="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>
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
      // Edit item form data
      editItemForm: {
        OrderID: null,
        SKU_Number: null,
        QTY: 1,
        originalSKU: null
      },

      // API connection status
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

      // Data arrays
      orders: [],
      orderItems: [],
      customers: [],
      salesReps: [],
      technicians: [],
      inventory: [],

      // Add items modal state
      itemToAdd: {
        SKU_Number: '',
        QTY: 1,
        DateAdded: null, 
        DateUsed: null   
      },
      selectedItems: [], 

      // UI state
      showAddItemsModal: false,  
      showEditItemModal: false,  
      showOrderCreateForm: false,
      expandedOrder: null,       
      selectedOrder: null,       
      editingOrder: null,        
      
      // Order form data
       orderForm: {
        CustomerID: '',
        SalesRepID: '',
        TechID: '',
        DateCreated: null,  
        DateAssigned: null, 
        DateCompleted: null, 
        Items: []
      },

      showOrderDetailsModal: false,

      // Date filtering options
       dateFilters: {
        startDate: null,
        endDate: null,
        filterBy: 'created',
      }
    };
  },

  computed: {
    // Connection status styling
    connectionStatusClass() {
      if (!this.connectionStatus) return '';
      return this.connectionStatus === 'connected' ? 'status-connected' : 'status-error';
    },
    
    // Connection status message
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
    
    // Available inventory items
    availableItems() {
      return this.inventory;
    },

    // Orders filtered by date
    filteredOrders() {
      if (!this.dateFilters.startDate && !this.dateFilters.endDate) {
        return this.orders;
      }
      
      const startDate = this.dateFilters.startDate ? new Date(this.dateFilters.startDate) : null;
      const endDate = this.dateFilters.endDate ? new Date(this.dateFilters.endDate) : null;
      
      return this.orders.filter(order => {
        let orderDate;
        
        switch(this.dateFilters.filterBy) {
          case 'created':
            orderDate = new Date(order.DateCreated);
            break;
          case 'assigned':
            if (!order.DateAssigned) return false;
            orderDate = new Date(order.DateAssigned);
            break;
          case 'completed':
            if (!order.DateCompleted) return false;
            orderDate = new Date(order.DateCompleted);
            break;
          default:
            orderDate = new Date(order.DateCreated);
        }
        
        let matchesStart = true;
        let matchesEnd = true;
        
        if (startDate) {
          const adjustedStartDate = new Date(startDate);
          adjustedStartDate.setHours(0, 0, 0, 0);
          matchesStart = orderDate >= adjustedStartDate;
        }
        
        if (endDate) {
          const adjustedEndDate = new Date(endDate);
          adjustedEndDate.setHours(23, 59, 59, 999);
          matchesEnd = orderDate <= adjustedEndDate;
        }
        
        return matchesStart && matchesEnd;
      });
    },
  },

  created() {
    this.checkApiConnection();
    this.loadData();
  },

  methods: {
    // Check if backend API is available
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

    // Set up form for editing an order
    editOrder(order) {
      this.editingOrder = order;
      
      this.orderForm = {
        CustomerID: order.CustomerID,
        SalesRepID: order.SalesRepID,
        TechID: order.TechID,
        Items: []
      };
      
      this.showOrderCreateForm = true;
    },

    // Get max available quantity for edit item form
    getMaxQuantityForEdit() {
      if (!this.editItemForm.SKU_Number) return 1;
      const item = this.inventory.find(item => item.SKU_Number === this.editItemForm.SKU_Number);
      return item ? item.Item_Quantity : 1; 
    },

    // Load all necessary data
    async loadData() {
      await this.loadCustomers();
      await this.loadSalesReps();
      await this.loadTechnicians();
      await this.loadInventory();
      await this.loadOrders();
      await this.loadOrderItems();
    },

    // Load orders from API
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

    // Load items for a specific order
    async loadOrderItems(orderID) {
      if (!orderID) return;
      
      this.loading.orderItems = true;
      this.error.orderItems = null;
      try {
        const orderItems = await api.fetchData(`/orders/${orderID}/items`);
        
        if (Array.isArray(orderItems)) {
          this.orderItems = orderItems;
        } else {
          console.error('Expected array of order items but got:', orderItems);
          this.error.orderItems = 'Unexpected data format received from server';
          this.orderItems = [];
        }
      } catch (error) {
        console.error('Error loading order items:', error);
        this.error.orderItems = `Failed to load order items: ${error.message}`;
        this.orderItems = [];
      } finally {
        this.loading.orderItems = false;
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

    // Load sales rep data
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

    // Load technician data
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

    // Load inventory data
    async loadInventory() {
      this.loading.inventory = true;
      this.error.inventory = null;
      try {
        const response = await api.getInventory();
        console.log('Inventory response:', response); 
        if (Array.isArray(response)) {
          this.inventory = response;
        } else {
          console.error('Unexpected inventory response format:', response);
          this.error.inventory = 'Unexpected data format received from server';
          this.inventory = [];
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
        this.error.inventory = `Failed to load inventory: ${error.message}`;
        this.inventory = [];
      } finally {
        this.loading.inventory = false;
      }
    },

    // Delete an item from an order
    async deleteOrderItem(item) {
      if (confirm(`Are you sure you want to remove ${item.ItemName} (SKU: ${item.SKU_Number}) from this order?`)) {
        try {
          await api.deleteOrderItem(this.expandedOrder, item.SKU_Number); 
          await this.loadOrderItems(this.expandedOrder);
        } catch (error) {
          console.error('Error deleting order item:', error);
          alert(`Error deleting order item: ${error.message}`);
        }
      }
    },

    // Get customer name from ID
    getCustomerName(customerID) {
      const customer = this.customers.find(c => c.CustomerID === customerID);
      return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
    },

    // Get sales rep name from ID
    getSalesRepName(salesRepID) {
      const salesRep = this.salesReps.find(s => s.SalesRepID === salesRepID);
      return salesRep ? `${salesRep.SalesRep_fName} ${salesRep.SalesRep_lName}` : 'Unknown';
    },

    // Get technician name from ID
    getTechnicianName(techID) {
      const technician = this.technicians.find(t => t.TechID === techID);
      return technician ? `${technician.firstName} ${technician.lastName}` : 'Unknown';
    },
    
    // Get item name from SKU
    getItemName(skuNumber) {
      const item = this.inventory.find(item => item.SKU_Number === skuNumber);
      return item ? item.ItemName : 'Unknown Item';
    },

    // Toggle order details view
    toggleOrderDetails(order) {
    this.viewOrderDetails(order);
    },

    // Show add items modal
    async showAddItems(order) {
      this.selectedOrder = order;
      try {
        if (this.inventory.length === 0) {
          await this.loadInventory();
        }
        this.selectedItems = []; 
        this.itemToAdd = { SKU_Number: '', QTY: 1 };
        this.showAddItemsModal = true;
        console.log('Available items for adding:', this.availableItems); 
      } catch (error) {
        console.error('Error preparing to add items:', error);
        this.error.inventory = 'Failed to load inventory items';
        alert('Error loading inventory. Cannot add items.');
      }
    },

    // Edit an order item
    editOrderItem(item) {
      this.editItemForm = {
        OrderID: this.expandedOrder,
        SKU_Number: item.SKU_Number,
        QTY: item.QTY || 1,
        originalSKU: item.SKU_Number
      };
      this.showEditItemModal = true;
    },

    // Cancel item editing
    cancelEditItem() {
      this.showEditItemModal = false;
      this.editItemForm = {
        OrderID: null,
        SKU_Number: null,
        QTY: 1,
        originalSKU: null
      };
    },

    // Save edited item
    async saveEditedItem() {
      try {
        console.log('Edit Item Form Data:', {
          OrderID: this.editItemForm.OrderID,
          SKU_Number: this.editItemForm.SKU_Number, 
          originalSKU: this.editItemForm.originalSKU,
          QTY: this.editItemForm.QTY
        });
        
        if (!this.editItemForm.QTY || isNaN(Number(this.editItemForm.QTY)) || this.editItemForm.QTY < 1) {
          alert('Please enter a valid quantity (minimum 1)');
          return;
        }

        const requestBody = {
          QTY: Number(this.editItemForm.QTY)
        };
        
        if (this.editItemForm.SKU_Number !== this.editItemForm.originalSKU) {
          requestBody.skuNumber = this.editItemForm.SKU_Number;
        }
        
        console.log('Sending update request:', {
          url: `/orderitems/${this.editItemForm.OrderID}/${this.editItemForm.originalSKU}`,
          body: requestBody
        });
        
        await api.fetchData(`/orderitems/${this.editItemForm.OrderID}/${this.editItemForm.originalSKU}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        await this.loadOrderItems(this.expandedOrder); 
        await this.loadInventory();

        this.cancelEditItem();
      } catch (error) {
        console.error('Error updating order item:', error);
        alert(`Error updating order item: ${error.message}`);
      }
    },

    // Cancel add items
    cancelAddItems() {
      this.showAddItemsModal = false;
      this.selectedOrder = null;
      this.selectedItems = [];
      this.itemToAdd = { SKU_Number: '', QTY: 1 };
    },
    
    // Get max available quantity
    getMaxQuantity() {
      if (!this.itemToAdd.SKU_Number) return 1;
      const item = this.inventory.find(item => item.SKU_Number === this.itemToAdd.SKU_Number);
      return item ? item.Item_Quantity : 1;
    },

    // Add item to selection list
    addToItemsList() {
      if (!this.itemToAdd.SKU_Number || this.itemToAdd.QTY < 1) return;

      const existingIndex = this.selectedItems.findIndex(
        item => item.SKU_Number === this.itemToAdd.SKU_Number
      );

      if (existingIndex >= 0) {
        this.selectedItems[existingIndex].QTY += this.itemToAdd.QTY;
      } else {
        this.selectedItems.push({
          SKU_Number: this.itemToAdd.SKU_Number,
          QTY: this.itemToAdd.QTY
        });
      }

      this.itemToAdd = { SKU_Number: '', QTY: 1 };
    },

    // Remove item from selection list
    removeItemFromList(index) {
      this.selectedItems.splice(index, 1);
    },

    // Add selected items to order
    async addItemsToOrder() {
      if (this.selectedItems.length === 0) {
        alert('Please add at least one item to the list.');
        return;
      }

      try {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
        
        const orderID = this.selectedOrder.OrderID;
        const isExpanded = this.expandedOrder === orderID;
        
        this.showAddItemsModal = false;
        
        for (const item of this.selectedItems) {
          await api.fetchData('/orderitems', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skuNumber: item.SKU_Number,
              orderID: orderID,
              QTY: item.QTY,
              dateAdded: formattedDate,
              dateUsed: null
            })
          });
        }

        await api.fetchData(`/orders/${orderID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastModified: formattedDate
          })
        });

        await Promise.all([
          this.loadInventory(),
          this.loadOrders()
        ]);
        
        if (isExpanded) {
          await this.loadOrderItems(orderID);
        }
        
        this.selectedOrder = null;
        this.selectedItems = [];
        this.itemToAdd = { SKU_Number: '', QTY: 1 };
        
      } catch (error) {
        console.error('Error adding items to order:', error);
        alert(`Error adding items to order: ${error.message}`);
        
        this.showAddItemsModal = false;
        this.selectedOrder = null;
        this.selectedItems = [];
        this.itemToAdd = { SKU_Number: '', QTY: 1 };
      }
    },

    // View order details
    viewOrderDetails(order) {
      this.selectedOrder = order;
      this.expandedOrder = order.OrderID;
      this.loadOrderItems(order.OrderID);
      this.showOrderDetailsModal = true;
    },

    // Close order details modal
    closeOrderDetails() {
      this.showOrderDetailsModal = false;
      this.expandedOrder = null;
      this.orderItems = [];
    },

    // Mark an item as used by technician
    async markItemAsUsed(item) {
      try {
        await api.markItemAsUsed(this.expandedOrder, item.SKU_Number);
        await this.loadOrderItems(this.expandedOrder);
      } catch (error) {
        console.error('Error marking item as used:', error);
        alert(`Error updating item status: ${error.message}`);
      }
    },

    // Save or update an order
    async saveOrder() {
      try {
        // Set creation date for new orders
        if (!this.editingOrder) {
          this.orderForm.DateCreated = new Date().toISOString();
        }
        
        // Update assignment date if technician changed
        if (this.orderForm.TechID && 
            (!this.editingOrder || !this.editingOrder.TechID || 
             this.editingOrder.TechID !== this.orderForm.TechID)) {
          this.orderForm.DateAssigned = new Date().toISOString();
        }
        
        const orderData = {
          customerID: this.orderForm.CustomerID,
          techID: this.orderForm.TechID,
          salesRepID: this.orderForm.SalesRepID,
          dateCreated: this.orderForm.DateCreated,
          dateAssigned: this.orderForm.DateAssigned,
          dateCompleted: this.orderForm.DateCompleted,
          lastModified: new Date().toISOString()
        };

        if (this.editingOrder) {
          // Update existing order
          await api.fetchData(`/orders/${this.editingOrder.OrderID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
        } else {
          // Create new order
          await api.fetchData('/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

    // Complete an order
    async completeOrder(orderID) {
      if (confirm('Are you sure you want to complete this order? Unused items will be returned to inventory.')) {
        try {
          const result = await api.completeOrder(orderID);
          
          if (result.itemsReturned > 0) {
            alert(`Order completed. ${result.itemsReturned} unused items were returned to inventory.`);
          } else {
            alert('Order completed successfully.');
          }
          
          await this.loadOrders();
          await this.loadInventory();
          
          if (this.showOrderDetailsModal && this.selectedOrder && this.selectedOrder.OrderID === orderID) {
            this.closeOrderDetails();
          }
        } catch (error) {
          console.error('Error completing order:', error);
          alert(`Error completing order: ${error.message}`);
        }
      }
    },

    // Delete an order
    async deleteOrder(orderID) {
      if (confirm('Are you sure you want to delete this entire order? This action cannot be undone.')) {
        try {
          await api.fetchData(`/orders/${orderID}`, {
            method: 'DELETE'
          });

          if (this.expandedOrder === orderID) {
             this.expandedOrder = null;
             this.orderItems = [];
          }
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
    },

    // Format date for display
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  }
}

</script>

<style scoped>
/* Styles for the Add/Edit Item Modals */

.item-selection-area {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.item-selection-area .form-group {
  flex: 1;
  min-width: 200px;
}

.btn-add-item {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  height: 38px;
  white-space: nowrap;
}

.btn-add-item:hover {
  background-color: #45a049;
}

.btn-add-item:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.selected-items-list {
  margin-top: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  background-color: #f9f9f9;
}

.selected-items-list h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.items-table th,
.items-table td {
  padding: 0.6rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.items-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  font-size: 0.9rem;
}

.items-table td {
  vertical-align: middle;
}

.btn-remove {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-remove:hover {
  background-color: #d32f2f;
}

/* Form element styling */
input[type="number"],
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  height: 38px;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.loading {
  padding: 1rem;
  text-align: center;
  color: #666;
}

.error-message {
  padding: 1rem;
  color: red;
  border: 1px solid red;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.connection-status {
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  text-align: center;
}

.status-connected {
  color: green;
  border: 1px solid green;
  background-color: #e8f5e9;
}

.status-error {
  color: red;
  border: 1px solid red;
  background-color: #ffebee;
}

/* Date Filter Styling */
.date-filters {
  margin-bottom: 20px;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
}

.date-filters h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: #333;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
}

.filter-controls .form-group {
  flex: 1;
  min-width: 180px;
}

.btn-reset {
  background-color: #607d8b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  height: 38px;
}

.btn-reset:hover {
  background-color: #546e7a;
}

.btn-complete {
  background-color: #9c27b0;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 5px;
}

.btn-complete:hover {
  background-color: #8e24aa;
}

.btn-used {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 5px;
}

.btn-used:hover {
  background-color: #f57c00;
}

/* Order details modal */
.order-details-modal {
  width: 90%;
  max-width: 900px;
}

.order-summary {
  background-color: #f8f9fa;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-item {
  flex: 1;
  min-width: 200px;
  padding: 5px 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>