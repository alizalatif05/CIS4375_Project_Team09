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
              <th>SKU Number</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventory" :key="item.SKU_Number">
              <td>{{ item.SKU_Number }}</td>
              <td>{{ item.ItemName }}</td>
              <td>{{ item.Item_Desc }}</td>
              <td>{{ item.Item_Quantity }}</td>
              <td>
                <button @click="viewInventoryDetails(item)" class="btn-view">
                  View
                </button>
                <button @click="editInventory(item)" class="btn-edit">
                  Edit
                </button>
                <button @click="deleteInventory(item.SKU_Number)" class="btn-delete">
                  Delete
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
                <label>Item Name:</label>
                <input v-model="inventoryForm.ItemName" type="text" required />
              </div>
              <div class="form-group">
                <label>Description:</label>
                <input v-model="inventoryForm.Item_Desc" type="text" />
              </div>
              <div class="form-group">
                <label>Quantity:</label>
                <input v-model="inventoryForm.Item_Quantity" type="number" required />
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
              <p><strong>SKU Number:</strong> {{ selectedInventory.SKU_Number }}</p>
              <p><strong>Item Name:</strong> {{ selectedInventory.ItemName }}</p>
              <p><strong>Description:</strong> {{ selectedInventory.Item_Desc }}</p>
              <p><strong>Quantity:</strong> {{ selectedInventory.Item_Quantity }}</p>
            </div>
            <div class="form-actions">
              <button @click="editInventory(selectedInventory)" class="btn-edit">Edit</button>
              <button @click="selectedInventory = null" class="btn-cancel">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Technician Inventory Tab -->
    <div v-if="activeTab === 'technicianInventory'" class="tab-content">
      <div class="actions">
        <button @click="showTechInventoryCreateForm = true" class="create-btn">
          Assign Item to Technician
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
              <th>SKU Number</th>
              <th>Technician ID</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="techItem in technicianInventory" :key="`${techItem.SKU_Number}-${techItem.TechID}`">
              <td>{{ techItem.SKU_Number }}</td>
              <td>{{ techItem.TechID }}</td>
              <td>{{ techItem.ItemName }}</td>
              <td>{{ techItem.Item_Desc }}</td>
              <td>
                <button @click="editTechInventory(techItem)" class="btn-edit">
                  Edit
                </button>
                <button @click="deleteTechInventory(techItem.SKU_Number, techItem.TechID)" class="btn-delete">
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Technician Inventory Form Modal -->
      <div v-if="showTechInventoryCreateForm" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Assign Item to Technician</h3>
            <button @click="cancelTechInventoryForm" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTechInventory">
              <div class="form-group">
                <label>Item:</label>
                <select v-model="techInventoryForm.SKU_Number" required>
                  <option value="">Select an item</option>
                  <option v-for="item in inventory" :key="item.SKU_Number" :value="item.SKU_Number">
                    {{ item.ItemName }} ({{ item.SKU_Number }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Technician:</label>
                <select v-model="techInventoryForm.TechID" required>
                  <option value="">Select a technician</option>
                  <option v-for="tech in technicians" :key="tech.TechID" :value="tech.TechID">
                    {{ tech.firstName }} {{ tech.lastName }} ({{ tech.TechID }})
                  </option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-save">Assign</button>
                <button type="button" @click="cancelTechInventoryForm" class="btn-cancel">Cancel</button>
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
import api from '../../../backend/services/api.js';

export default {
  data() {
    return {
      activeTab: 'inventory',
      connectionStatus: null,

      // Loading and error states
      loading: {
        inventory: false,
        technicianInventory: false,
        technicians: false
      },
      error: {
        inventory: null,
        technicianInventory: null,
        technicians: null
      },

      // Data
      inventory: [],
      technicianInventory: [],
      technicians: [],

      // UI State
      selectedInventory: null,
      editingInventory: null,
      editingTechInventory: null,
      showInventoryCreateForm: false,
      showTechInventoryCreateForm: false,

      // Forms
      inventoryForm: {
        ItemName: '',
        Item_Desc: '',
        Item_Quantity: 0
      },
      techInventoryForm: {
        SKU_Number: '',
        TechID: ''
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
    this.loadData();
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

    // Load all data
    async loadData() {
      await this.loadInventory();
      await this.loadTechnicianInventory();
      await this.loadTechnicians();
    },

    // Inventory methods
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
      this.inventoryForm = {
        ItemName: item.ItemName,
        Item_Desc: item.Item_Desc,
        Item_Quantity: item.Item_Quantity
      };
      this.showInventoryCreateForm = true;
    },

    editTechInventory(techItem) {
      this.editingTechInventory = techItem;
      this.techInventoryForm = {
        SKU_Number: techItem.SKU_Number,
        TechID: techItem.TechID
      };
      this.showTechInventoryCreateForm = true;
    },

    async saveInventory() {
      try {
        if (this.editingInventory) {
          await api.fetchData(`/inventory/${this.editingInventory.SKU_Number}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: this.inventoryForm.ItemName,
              quantity: this.inventoryForm.Item_Quantity,
              itemDesc: this.inventoryForm.Item_Desc // Changed from 'category' to 'itemDesc'
            })
          });
        } else {
          await api.fetchData('/inventory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              itemName: this.inventoryForm.ItemName,
              itemDesc: this.inventoryForm.Item_Desc,
              itemQuantity: this.inventoryForm.Item_Quantity
            })
          });
        }
        await this.loadInventory();
        this.cancelInventoryForm();
      } catch (error) {
        console.error('Error saving inventory:', error);
        alert(`Error saving inventory: ${error.message}`);
      }
    },

    async deleteInventory(sku) {
      if (confirm('Are you sure you want to delete this inventory item?')) {
        try {
          await api.fetchData(`/inventory/${sku}`, {
            method: 'DELETE'
          });
          await this.loadInventory();
        } catch (error) {
          console.error('Error deleting inventory:', error);
          alert(`Error deleting inventory: ${error.message}`);
        }
      }
    },

    cancelInventoryForm() {
      this.editingInventory = null;
      this.showInventoryCreateForm = false;
      this.inventoryForm = {
        ItemName: '',
        Item_Desc: '',
        Item_Quantity: 0
      };
    },

    // Technician Inventory methods
    async loadTechnicianInventory() {
      this.loading.technicianInventory = true;
      this.error.technicianInventory = null;
      try {
        this.technicianInventory = await api.fetchData('/techinventory');
      } catch (error) {
        console.error('Error loading technician inventory:', error);
        this.error.technicianInventory = `Failed to load technician inventory: ${error.message}`;
      } finally {
        this.loading.technicianInventory = false;
      }
    },


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

    async saveTechInventory() {
      try {
        if (this.editingTechInventory) {
          // Update existing assignment
          await api.fetchData(`/techinventory/${this.editingTechInventory.SKU_Number}/${this.editingTechInventory.TechID}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              newSkuNumber: this.techInventoryForm.SKU_Number,
              newTechId: this.techInventoryForm.TechID
            })
          });
        } else {
          // Create new assignment (or reactivate soft-deleted one)
          await api.fetchData('/techinventory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              skuNumber: this.techInventoryForm.SKU_Number,
              techId: this.techInventoryForm.TechID
            })
          });
        }
        await this.loadTechnicianInventory();
        this.cancelTechInventoryForm();
      } catch (error) {
        console.error('Error assigning item to technician:', error);
        alert(`Error assigning item: ${error.message}`);
      }
    },

    async deleteTechInventory(sku, techId) {
      if (confirm('Are you sure you want to remove this assignment?')) {
        try {
          // Note: You'll need to implement this endpoint in your backend
          await api.fetchData(`/techinventory/${sku}/${techId}`, {
            method: 'DELETE'
          });
          await this.loadTechnicianInventory();
        } catch (error) {
          console.error('Error removing assignment:', error);
          alert(`Error removing assignment: ${error.message}`);
        }
      }
    },

    cancelTechInventoryForm() {
      this.showTechInventoryCreateForm = false;
      this.techInventoryForm = {
        SKU_Number: '',
        TechID: ''
      };
    }
  }
};
</script>
