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

    <!--Initial Table-->
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
          <template v-for="order in orders" :key="order.OrderID">
            <tr>
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
            <!-- Order details row -->
            <tr v-if="expandedOrder === order.OrderID" class="order-details-row">
              <td colspan="5">
                <div class="order-details-container">
                  <h3>Order Items</h3>
                  <div v-if="loading.orderItems" class="loading">Loading order items...</div>
                  <div v-else-if="error.orderItems" class="error-message">
                    {{ error.orderItems }}
                  </div>
                  <table v-else class="order-items-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>SKU Number</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in orderItems" :key="item.SKU_Number">
                        <td>{{ item.ItemName }}</td>
                        <td>{{ item.SKU_Number }}</td>
                        <td>{{ item.QTY }}</td>
                        <td>
                          <button @click="editOrderItem(item)" class="btn-edit">Edit</button>
                          <button @click="deleteOrderItem(item)" class="btn-delete">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>



    </div>

      <!--Edit Order-->
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
  </div> </template>

<script>
import "@/assets/css/style.css";
import api from '../../services/api.js';

export default {
  data() {
    return {
      // State for the edit item form
      editItemForm: {
        OrderID: null,
        SKU_Number: null,
        QTY: 1,
        originalSKU: null // Store the original SKU in case it's changed
      },

      // API connection status ('connected', 'error', or null)
      connectionStatus: null,

      // Loading indicators for different data types
      loading: {
        orders: false,
        orderItems: false,
        customers: false,
        salesReps: false,
        technicians: false,
        inventory: false
      },
      // Error messages for different data types
      error: {
        orders: null,
        orderItems: null,
        customers: null,
        salesReps: null,
        technicians: null,
        inventory: null
      },

      // Data arrays populated from the API
      orders: [],
      orderItems: [], // Items for the currently expanded order
      customers: [],
      salesReps: [],
      technicians: [],
      inventory: [], // Available inventory items

      // State for the 'Add Items' modal form
      itemToAdd: {
        SKU_Number: '',
        QTY: 1
      },
      selectedItems: [], // List of items staged to be added to an order

      // UI State properties
      showAddItemsModal: false,  // Controls visibility of the add items modal
      showEditItemModal: false,  // Controls visibility of the edit item modal
      showOrderCreateForm: false,// Controls visibility of the create/edit order modal
      expandedOrder: null,       // OrderID of the currently expanded order, or null
      selectedOrder: null,       // The order object currently selected for actions (e.g., adding items)
      editingOrder: null,        // The order object being edited, or null if creating

      // Form data for creating/editing an order
      orderForm: {
        CustomerID: '',
        SalesRepID: '',
        TechID: '',
        Items: [] // Note: Items are now added separately via the 'Add Items' modal
      }
    };
  },
  computed: {
    // Determines the CSS class for the connection status indicator
    connectionStatusClass() {
      if (!this.connectionStatus) return '';
      return this.connectionStatus === 'connected' ? 'status-connected' : 'status-error';
    },
    // Determines the message displayed in the connection status indicator
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
    // Provides the list of available inventory items (assumes backend provides filtered list if needed)
    availableItems() {
      return this.inventory;
    }
  },
  created() {
    // Initial actions when the component is created
    this.checkApiConnection();
    this.loadData();
  },
  methods: {
    // Checks the connection status with the backend API and provides user feedback.
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

        // editOrder method - Sets up the form for editing an existing order
    editOrder(order) {
      // Store the order being edited
      this.editingOrder = order;

      // Populate the form with the order's current data
      this.orderForm = {
        CustomerID: order.CustomerID,
        SalesRepID: order.SalesRepID,
        TechID: order.TechID,
        Items: [] // Items are handled separately
      };

      // Display the edit form modal
      this.showOrderCreateForm = true;
    },

    // Calculates the maximum quantity allowed for an item being edited, based on available inventory.
    getMaxQuantityForEdit() {
      if (!this.editItemForm.SKU_Number) return 1;
      const item = this.inventory.find(item => item.SKU_Number === this.editItemForm.SKU_Number);
      // Consider current quantity + available stock? Or just available stock? Assuming available stock for now.
      // If editing, it should probably be current quantity + remaining stock. Needs clarification based on backend logic.
      // For simplicity, returning available quantity from inventory.
      return item ? item.Item_Quantity : 1;
    },

    // Orchestrates loading of all necessary data for the component.
    async loadData() {
      await this.loadCustomers();
      await this.loadSalesReps();
      await this.loadTechnicians();
      await this.loadInventory(); // Load inventory first so item names are available
      await this.loadOrders();     // Load orders last
      await this.loadOrderItems();
    },

    // Fetches the list of orders from the API.
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

    // Fetches the detailed items (including quantity) for a specific order from the API. ERROR HERE

 // Fetches the detailed items for a specific order from the API.
async loadOrderItems(orderID) {
  if (!orderID) return; // Don't proceed if no order ID is provided

  this.loading.orderItems = true;
  this.error.orderItems = null;
  try {
    // Use the dedicated endpoint for order items
    const orderItems = await api.fetchData(`/orders/${orderID}/items`);

    // Since we're now using the correct endpoint, we expect an array response
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
    this.orderItems = []; // Clear items on error
  } finally {
    this.loading.orderItems = false;
  }
},

    // Fetches the list of customers from the API.
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

    // Fetches the list of sales representatives from the API.
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

    // Fetches the list of technicians from the API.
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

    // Fetches the list of inventory items from the API.
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
          this.inventory = []; // Ensure inventory is an array
        }
      } catch (error) {
        console.error('Error loading inventory:', error);
        this.error.inventory = `Failed to load inventory: ${error.message}`;
        this.inventory = []; // Ensure inventory is an array
      } finally {
        this.loading.inventory = false;
      }
    },

    // Deletes a specific item from an order via API call after confirmation.
    async deleteOrderItem(item) {
      if (confirm(`Are you sure you want to remove ${item.ItemName} (SKU: ${item.SKU_Number}) from this order?`)) {
        try {
          // Assuming api.deleteOrderItem takes orderID and skuNumber
          await api.deleteOrderItem(this.expandedOrder, item.SKU_Number);
          // Refresh the order items list for the currently expanded order
          await this.loadOrderItems(this.expandedOrder);
        } catch (error) {
          console.error('Error deleting order item:', error);
          alert(`Error deleting order item: ${error.message}`);
        }
      }
    },

    // Helper method: Finds and returns the customer's full name based on ID.
    getCustomerName(customerID) {
      const customer = this.customers.find(c => c.CustomerID === customerID);
      return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
    },

    // Helper method: Finds and returns the sales rep's full name based on ID.
    getSalesRepName(salesRepID) {
      const salesRep = this.salesReps.find(s => s.SalesRepID === salesRepID);
      return salesRep ? `${salesRep.SalesRep_fName} ${salesRep.SalesRep_lName}` : 'Unknown';
    },

    // Helper method: Finds and returns the technician's full name based on ID.
    getTechnicianName(techID) {
      const technician = this.technicians.find(t => t.TechID === techID);
      return technician ? `${technician.firstName} ${technician.lastName}` : 'Unknown';
    },

    // Helper method: Finds and returns the item's name based on SKU number.
    getItemName(skuNumber) {
      const item = this.inventory.find(item => item.SKU_Number === skuNumber);
      return item ? item.ItemName : 'Unknown Item';
    },

    // Toggles the visibility of an order's details section and loads/clears its items.
    toggleOrderDetails(order) {
      if (this.expandedOrder === order.OrderID) {
        // Collapse the currently expanded order
        this.expandedOrder = null;
        this.orderItems = []; // Clear items
      } else {
        // Expand the selected order
        this.expandedOrder = order.OrderID;
        this.loadOrderItems(order.OrderID); // Load items for the expanded order
      }
    },
      // Opens the modal for adding multiple items to the selected order.
      async showAddItems(order) {
        this.selectedOrder = order; // Set the target order
        try {
          // Ensure inventory is loaded before opening the modal
          if (this.inventory.length === 0) {
            await this.loadInventory();
          }
          // Reset the item selection form and list
          this.selectedItems = [];
          this.itemToAdd = { SKU_Number: '', QTY: 1 };
          this.showAddItemsModal = true; // Open the modal
          console.log('Available items for adding:', this.availableItems);
        } catch (error) {
          console.error('Error preparing to add items:', error);
          this.error.inventory = 'Failed to load inventory items';
          alert('Error loading inventory. Cannot add items.');
        }
      },
    // Prepares the edit item modal with the selected item's data.
    editOrderItem(item) {
      this.editItemForm = {
        OrderID: this.expandedOrder,         // Get OrderID from the currently expanded order
        SKU_Number: item.SKU_Number,
        QTY: item.QTY || 1,       // Use existing quantity or default to 1
        originalSKU: item.SKU_Number      // Store the original SKU
      };
      this.showEditItemModal = true;
    },

    // Closes the edit item modal and resets the form data.
    cancelEditItem() {
      this.showEditItemModal = false;
      this.editItemForm = { // Reset form
        OrderID: null,
        SKU_Number: null,
        QTY: 1,
        originalSKU: null
      };
    },

    // Saves the edited order item via API (replaces old item with new details).
async saveEditedItem() {
  try {
    // Add more debugging to see exactly what's happening
    console.log('Edit Item Form Data:', {
      OrderID: this.editItemForm.OrderID,
      SKU_Number: this.editItemForm.SKU_Number,
      originalSKU: this.editItemForm.originalSKU,
      QTY: this.editItemForm.QTY
    });

    // Make sure QTY is defined and valid
    if (!this.editItemForm.QTY || isNaN(Number(this.editItemForm.QTY)) || this.editItemForm.QTY < 1) {
      alert('Please enter a valid quantity (minimum 1)');
      return;
    }

    // If we're not changing the SKU, set it to the original to avoid confusion
    const requestBody = {
      QTY: Number(this.editItemForm.QTY)
    };

    // Only include skuNumber if it's actually changing
    if (this.editItemForm.SKU_Number !== this.editItemForm.originalSKU) {
      requestBody.skuNumber = this.editItemForm.SKU_Number;
    }

    console.log('Sending update request:', {
      url: `/orderitems/${this.editItemForm.OrderID}/${this.editItemForm.originalSKU}`,
      body: requestBody
    });

    // Call the PUT endpoint
    await api.fetchData(`/orderitems/${this.editItemForm.OrderID}/${this.editItemForm.originalSKU}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    // Refresh the order items
    await this.loadOrderItems(this.expandedOrder);
    await this.loadInventory();

    this.cancelEditItem();
  } catch (error) {
    console.error('Error updating order item:', error);
    alert(`Error updating order item: ${error.message}`);
  }
},

    // Closes the 'Add Items' modal and clears the selection list and form.
    cancelAddItems() {
      this.showAddItemsModal = false;
      this.selectedOrder = null;
      this.selectedItems = [];
      this.itemToAdd = { SKU_Number: '', QTY: 1 };
    },

    // Helper method: Calculates max quantity for the item selected in the 'Add Items' modal.
    getMaxQuantity() {
      if (!this.itemToAdd.SKU_Number) return 1; // No item selected
      const item = this.inventory.find(item => item.SKU_Number === this.itemToAdd.SKU_Number);
      return item ? item.Item_Quantity : 1; // Return available quantity or 1 if not found
    },

    // Adds the currently selected item and quantity to the temporary list in the 'Add Items' modal.
    addToItemsList() {
      if (!this.itemToAdd.SKU_Number || this.itemToAdd.QTY < 1) return; // Validation

      const existingIndex = this.selectedItems.findIndex(
        item => item.SKU_Number === this.itemToAdd.SKU_Number
      );

      if (existingIndex >= 0) {
        // If item already in list, update its quantity
        // TODO: Add check against available inventory if necessary
        this.selectedItems[existingIndex].QTY += this.itemToAdd.QTY;
      } else {
        // If new item, add it to the list
        this.selectedItems.push({
          SKU_Number: this.itemToAdd.SKU_Number,
          QTY: this.itemToAdd.QTY
        });
      }

      // Reset the form for the next item
      this.itemToAdd = { SKU_Number: '', QTY: 1 };
    },

    // Removes an item from the temporary list in the 'Add Items' modal based on its index.
    removeItemFromList(index) {
      this.selectedItems.splice(index, 1);
    },

    // Submits the list of selected items (with quantities) from the modal to the backend API.
    async addItemsToOrder() {
      if (this.selectedItems.length === 0) {
        alert('Please add at least one item to the list.');
        return;
      }

      try {
        // Iterate through the list of items to add
        for (const item of this.selectedItems) {
          // Call API to add each item with its quantity
          await api.fetchData('/orderitems', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skuNumber: item.SKU_Number,
              orderID: this.selectedOrder.OrderID,
              QTY: item.QTY
            })
          });
        }

        // Refresh the order items display if the affected order is currently expanded
        if (this.expandedOrder === this.selectedOrder.OrderID) {
          await this.loadOrderItems(this.selectedOrder.OrderID);
        }

        await this.loadInventory(); // Refresh inventory data

        this.cancelAddItems(); // Close modal and clear state

      } catch (error) {
        console.error('Error adding items to order:', error);
        alert(`Error adding items to order: ${error.message}`);
        // Consider error handling - should it stop adding subsequent items?
      }
    },

    // Saves a new order or updates an existing order's core details (Customer, Rep, Tech) via API.
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
          // Note: If a new order needs items immediately, the workflow might need adjustment.
          // Currently, items are added *after* order creation via the 'Add Items' button.
        }

        await this.loadOrders(); // Refresh the main orders list
        this.cancelOrderForm(); // Close the modal and reset form
      } catch (error) {
        console.error('Error saving order:', error);
        alert(`Error saving order: ${error.message}`);
      }
    },

    // Deletes an entire order via API call after confirmation.
    async deleteOrder(orderID) {
      if (confirm('Are you sure you want to delete this entire order? This action cannot be undone.')) {
        try {
          await api.fetchData(`/orders/${orderID}`, {
            method: 'DELETE'
          });
          // If the deleted order was expanded, collapse the details section
          if (this.expandedOrder === orderID) {
             this.expandedOrder = null;
             this.orderItems = [];
          }
          await this.loadOrders(); // Refresh the orders list
        } catch (error) {
          console.error('Error deleting order:', error);
          alert(`Error deleting order: ${error.message}`);
        }
      }
    },

    // Closes the main order create/edit modal and resets its form data and editing state.
    cancelOrderForm() {
      this.editingOrder = null; // Clear editing state
      this.showOrderCreateForm = false; // Hide modal
      // Reset form fields
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

<style scoped>
/* Styles for the Add/Edit Item Modals */

.item-selection-area {
  display: flex;
  gap: 1rem;
  align-items: flex-end; /* Align button with bottom of inputs */
  margin-bottom: 1.5rem;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.item-selection-area .form-group {
  flex: 1; /* Allow form groups to grow */
  min-width: 200px; /* Minimum width before wrapping */
}

.btn-add-item {
  background-color: #4CAF50; /* Green */
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  height: 38px; /* Match typical input height */
  white-space: nowrap; /* Prevent text wrapping */
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
  margin-bottom: 1rem; /* Increased spacing */
  color: #333;
  border-bottom: 1px solid #e0e0e0; /* Add separator */
  padding-bottom: 0.5rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem; /* Spacing after header */
}

.items-table th,
.items-table td {
  padding: 0.6rem 0.5rem; /* Slightly more vertical padding */
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.items-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  font-size: 0.9rem; /* Slightly smaller header */
}

.items-table td {
  vertical-align: middle; /* Align content vertically */
}

.btn-remove {
  background-color: #f44336; /* Red */
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

/* General Form Element Styling (can be in global CSS or scoped here) */
input[type="number"],
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%; /* Make inputs/selects fill their container */
  box-sizing: border-box; /* Include padding and border in element's total width/height */
  height: 38px; /* Consistent height */
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Basic Modal Styling (assuming styles like .modal, .modal-content etc. exist globally or in style.css) */
/* Add styles for .loading, .error-message, .status-connected, .status-error if not defined globally */
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
</style>
