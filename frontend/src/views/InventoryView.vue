<template>
  <div class="inventory-page">
    <h1>Inventory Management</h1>

    <div class="connection-status" v-if="connectionStatus">
      <span :class="connectionStatusClass">{{ connectionStatusMessage }}</span>
    </div>

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'inventory' }"
        @click="activeTab = 'inventory'"
      >
        Inventory
      </button>
      <button
        :class="{ active: activeTab === 'technicianInventory' }"
        @click="activeTab = 'technicianInventory'"
      >
        Technician Inventory
      </button>
    </div>

    <!-- Inventory Tab -->
    <div v-if="activeTab === 'inventory'" class="tab-content">
      <div class="actions">
        <button @click="showInventoryCreateForm = true" class="create-btn">
          Add New Inventory Item
        </button>
      </div>

      <div class="data-table">
        <h2>Inventory</h2>
        <div v-if="loading.inventory" class="loading">Loading inventory...</div>
        <div v-else-if="error.inventory" class="error-message">
          {{ error.inventory }}
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>SKU/ID</th>
              <th>Item Name</th>
              <th>Item Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventory" :key="item.SKU">
              <td>{{ item.SKU }}</td>
              <td>{{ item.ItemName }}</td>
              <td>{{ item.ItemQuantity }}</td>
              <td>
                <button @click="viewInventoryDetails(item)" class="btn-view">
                  View
                </button>
                <button @click="editInventory(item)" class="btn-edit">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Inventory Form Modal -->
      <div v-if="showInventoryCreateForm || editingInventory" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingInventory ? 'Edit Inventory Item' : 'Add New Inventory Item' }}</h3>
            <button @click="cancelInventoryForm" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveInventory">
              <div class="form-group">
                <label>SKU/ID:</label>
                <input v-model="inventoryForm.SKU" required />
              </div>
              <div class="form-group">
                <label>Item Name:</label>
                <input v-model="inventoryForm.ItemName" required />
              </div>
              <div class="form-group">
                <label>Item Quantity:</label>
                <input type="number" v-model="inventoryForm.ItemQuantity" required />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" @click="cancelInventoryForm" class="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Inventory Details Modal -->
      <div v-if="selectedInventory" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Inventory Details</h3>
            <button @click="selectedInventory = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-section">
              <p><strong>SKU/ID:</strong> {{ selectedInventory.SKU }}</p>
              <p><strong>Item Name:</strong> {{ selectedInventory.ItemName }}</p>
              <p><strong>Item Quantity:</strong> {{ selectedInventory.ItemQuantity }}</p>
            </div>
            <div class="form-actions">
              <button @click="editInventory(selectedInventory)" class="btn-edit">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Technician Inventory Tab -->
    <div v-if="activeTab === 'technicianInventory'" class="tab-content">
      <div class="actions">
        <button @click="showTechInventoryCreateForm = true" class="create-btn">
          Add New Technician Inventory
        </button>
      </div>

      <div class="data-table">
        <h2>Technician Inventory</h2>
        <div v-if="loading.technicianInventory" class="loading">Loading technician inventory...</div>
        <div v-else-if="error.technicianInventory" class="error-message">
          {{ error.technicianInventory }}
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Item SKU</th>
              <th>Technician ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="techItem in technicianInventory" :key="techItem.SKU + '-' + techItem.TechID">
              <td>{{ techItem.SKU }}</td>
              <td>{{ techItem.TechID }}</td>
              <td>
                <button @click="viewTechInventoryDetails(techItem)" class="btn-view">
                  View
                </button>
                <button @click="editTechInventory(techItem)" class="btn-edit">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Technician Inventory Form Modal -->
      <div v-if="showTechInventoryCreateForm || editingTechInventory" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingTechInventory ? 'Edit Technician Inventory' : 'Add New Technician Inventory' }}</h3>
            <button @click="cancelTechInventoryForm" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTechInventory">
              <div class="form-group">
                <label>Item SKU:</label>
                <input v-model="techInventoryForm.SKU" required />
              </div>
              <div class="form-group">
                <label>Technician ID:</label>
                <input v-model="techInventoryForm.TechID" required />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" @click="cancelTechInventoryForm" class="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Technician Inventory Details Modal -->
      <div v-if="selectedTechInventory" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Technician Inventory Details</h3>
            <button @click="selectedTechInventory = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-section">
              <p><strong>Item SKU:</strong> {{ selectedTechInventory.SKU }}</p>
              <p><strong>Technician ID:</strong> {{ selectedTechInventory.TechID }}</p>
            </div>
            <div class="form-actions">
              <button @click="editTechInventory(selectedTechInventory)" class="btn-edit">Edit</button>
            </div>
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
      activeTab: 'inventory',
      connectionStatus: null,

      // Loading and error states
      loading: {
        inventory: false,
        technicianInventory: false
      },
      error: {
        inventory: null,
        technicianInventory: null
      },

      // Inventory data
      inventory: [],
      selectedInventory: null,
      editingInventory: null,
      showInventoryCreateForm: false,
      inventoryForm: {
        SKU: '',
        ItemName: '',
        ItemQuantity: 0
      },

      // Technician Inventory data
      technicianInventory: [],
      selectedTechInventory: null,
      editingTechInventory: null,
      showTechInventoryCreateForm: false,
      techInventoryForm: {
        SKU: '',
        TechID: ''
      }
    }
  },
  computed: {
    connectionStatusClass() {
      if (!this.connectionStatus) return '';
      return this.connectionStatus === 'connected' ? 'status-connected' : 'status-error';
    },
    connectionStatusMessage() {
      switch(this.connectionStatus) {
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
    loadData() {
      this.loadInventory();
      this.loadTechnicianInventory();
    },

    // Inventory data methods
    async loadInventory() {
      this.loading.inventory = true;
      this.error.inventory = null;

      try {
        this.inventory = await api.getInventory();
      } catch (error) {
        console.error('Error loading inventory:', error);
        this.error.inventory = `Failed to load inventory: ${error.message}`;
      } finally {
        this.loading.inventory = false;
      }
    },

    viewInventoryDetails(item) {
      this.selectedInventory = item;
    },

    editInventory(item) {
      this.editingInventory = item;
      this.inventoryForm = { ...item };

      // If an inventory item was being viewed, close the view modal
      this.selectedInventory = null;
    },

    async saveInventory() {
      try {
        if (this.editingInventory) {
          await api.updateInventory(this.editingInventory.SKU, this.inventoryForm);
        } else {
          await api.createInventory(this.inventoryForm);
        }

        // Refresh the inventory list
        await this.loadInventory();
        this.cancelInventoryForm();
      } catch (error) {
        console.error('Error saving inventory:', error);
        alert(`Error saving inventory: ${error.message}`);
      }
    },

    cancelInventoryForm() {
      this.editingInventory = null;
      this.showInventoryCreateForm = false;
      this.inventoryForm = {
        SKU: '',
        ItemName: '',
        ItemQuantity: 0
      };
    },

    // Technician Inventory data methods
    async loadTechnicianInventory() {
      this.loading.technicianInventory = true;
      this.error.technicianInventory = null;

      try {
        this.technicianInventory = await api.getTechnicianInventory();
      } catch (error) {
        console.error('Error loading technician inventory:', error);
        this.error.technicianInventory = `Failed to load technician inventory: ${error.message}`;
      } finally {
        this.loading.technicianInventory = false;
      }
    },

    viewTechInventoryDetails(techItem) {
      this.selectedTechInventory = techItem;
    },

    editTechInventory(techItem) {
      this.editingTechInventory = techItem;
      this.techInventoryForm = { ...techItem };

      // If a technician inventory item was being viewed, close the view modal
      this.selectedTechInventory = null;
    },

    async saveTechInventory() {
      try {
        if (this.editingTechInventory) {
          await api.updateTechnicianInventory(this.editingTechInventory.SKU, this.techInventoryForm);
        } else {
          await api.createTechnicianInventory(this.techInventoryForm);
        }

        // Refresh the technician inventory list
        await this.loadTechnicianInventory();
        this.cancelTechInventoryForm();
      } catch (error) {
        console.error('Error saving technician inventory:', error);
        alert(`Error saving technician inventory: ${error.message}`);
      }
    },

    cancelTechInventoryForm() {
      this.editingTechInventory = null;
      this.showTechInventoryCreateForm = false;
      this.techInventoryForm = {
        SKU: '',
        TechID: ''
      };
    }
  }
}
</script>
