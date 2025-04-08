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
    <!--Inventory tab-->
    <div v-if="activeTab === 'inventory'" class="tab-content">
      <div class="actions">
        <button @click="showInventoryCreateForm = true" class="create-btn">
          Add New Inventory Item
        </button>
      </div>
    <!--Inventory table-->
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
                <input v-model.number="inventoryForm.Item_Quantity" type="number" required />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" @click="cancelInventoryForm" class="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div v-if="selectedInventory && !showInventoryCreateForm && !editingInventory" class="modal">
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
               <button @click="editFromDetails(selectedInventory)" class="btn-edit">Edit</button>
               <button @click="selectedInventory = null" class="btn-cancel">Close</button>
             </div>
           </div>
         </div>
       </div>
    </div>

    <div v-if="activeTab === 'technicianInventory'" class="tab-content">
      <div class="actions">
        <button v-if="isAdmin" @click="showBulkAssignForm = true" class="create-btn bulk-assign-btn">
          Bulk Assign Items to Technician
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
              <th>Quantity</th> </tr>
          </thead>
          <tbody>
            <tr v-for="techItem in technicianInventory" :key="`${techItem.SKU_Number}-${techItem.TechID}`">
              <td>{{ techItem.SKU_Number }}</td>
              <td>{{ techItem.TechID }}</td>
              <td>{{ techItem.ItemName }}</td>
              <td>{{ techItem.Item_Desc }}</td>
              <td>{{ techItem.QTY }}</td> </tr>
          </tbody>
        </table>
      </div>

      <div v-if="showBulkAssignForm" class="modal">
         <div class="modal-content">
           <div class="modal-header">
             <h3>Bulk Assign Items to Technician</h3>
             <button @click="cancelBulkAssignForm" class="close-btn">&times;</button>
           </div>
           <div class="modal-body">
             <form @submit.prevent="saveBulkAssignment">
               <div class="form-group">
                 <label>Select Technician:</label>
                 <select v-model="bulkAssignForm.technicianId" required>
                   <option value="">Select a technician</option>
                   <option v-for="tech in technicians" :key="tech.TechID" :value="tech.TechID">
                     {{ tech.firstName }} {{ tech.lastName }} ({{ tech.TechID }})
                   </option>
                 </select>
               </div>

               <div class="form-group">
                 <label>Select Items to Assign:</label>
                 <div class="inventory-items-list">
                   <div v-if="loading.inventory" class="loading">Loading inventory...</div>
                   <div v-else>
                     <div class="search-box">
                       <input
                         v-model="itemSearchQuery"
                         type="text"
                         placeholder="Search items..."
                         @input="filterInventoryItems"
                       />
                     </div>

                     <div class="item-selection">
                       <label class="select-all">
                         <input
                           type="checkbox"
                           :checked="allItemsSelected"
                           @change="toggleAllItems"
                         />
                          Select All Visible
                       </label>

                       <div class="items-container">
                         <div
                           v-for="item in filteredInventoryItems"
                           :key="item.SKU_Number"
                           class="item-checkbox"
                         >
                           <label>
                              <div class="item-row">
                                 <span>
                                     <input
                                     type="checkbox"
                                     :value="item.SKU_Number"
                                     v-model="bulkAssignForm.selectedItems"
                                     @change="initializeQuantity(item.SKU_Number)"
                                     />
                                     {{ item.ItemName }} (SKU: {{ item.SKU_Number }}, Avail: {{ item.Item_Quantity }})
                                 </span>
                                 <div v-if="isItemSelected(item.SKU_Number)" class="quantity-input">
                                     <label>Qty:</label>
                                     <input
                                     type="number"
                                     v-model.number="bulkAssignForm.quantities[item.SKU_Number]"
                                     min="1"
                                     :max="item.Item_Quantity"
                                     required
                                     @click.stop />
                                 </div>
                              </div>
                           </label>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               <div class="selected-count">
                 {{ bulkAssignForm.selectedItems.length }} items selected
               </div>

               <div class="form-actions">
                  <button
                     type="submit"
                     class="btn-save"
                     :disabled="!bulkAssignForm.technicianId || bulkAssignForm.selectedItems.length === 0 || processingBulkAssign"
                   >
                     {{ processingBulkAssign ? 'Assigning...' : 'Assign Items' }}
                   </button>
                 <button type="button" @click="cancelBulkAssignForm" class="btn-cancel">Cancel</button>
               </div>
             </form>
           </div>
         </div>
       </div>
    </div>
  </div>
</template>

<script>
import "@/assets/css/style.css"; // Adjust path as needed
import api from '../../services/api.js'; // Adjust path as needed

export default {
  data() {
    return {
      isAdmin: false,
      activeTab: 'inventory', // Default tab
      connectionStatus: null,
      showBulkAssignForm: false,
      itemSearchQuery: '',
      filteredInventoryItems: [],
      bulkAssignForm: {
        technicianId: '',
        selectedItems: [],
        quantities: {}
      },
      processingBulkAssign: false,

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

      // UI State for Inventory Tab (Kept)
      selectedInventory: null,
      editingInventory: null,
      showInventoryCreateForm: false,

      // UI State for Technician Inventory Tab (Individual form removed)
      // editingTechInventory: null, // Removed
      // showTechInventoryCreateForm: false, // Removed

      // Forms for Inventory Tab (Kept)
      inventoryForm: {
        ItemName: '',
        Item_Desc: '',
        Item_Quantity: 0
      },

      // Forms for Technician Inventory Tab (Individual form removed)
      // techInventoryForm: { // Removed
      //   SKU_Number: '',
      //   TechID: ''
      // }
    };
  },
  computed: {
    connectionStatusClass() {
      if (!this.connectionStatus) return '';
      return this.connectionStatus === 'connected' ? 'status-connected' : 'status-error';
    },
    allItemsSelected() {
       // Check only against currently filtered items
       if (this.filteredInventoryItems.length === 0) return false;
       return this.filteredInventoryItems.every(item => this.bulkAssignForm.selectedItems.includes(item.SKU_Number));
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

  watch: {
    inventory: {
      handler() {
         // Update filtered list when base inventory changes
        this.filterInventoryItems();
      },
      immediate: true
    },
     itemSearchQuery() {
         // Refilter when search query changes
         this.filterInventoryItems();
    }
  },

  created() {
    this.checkApiConnection();
    this.checkAdminStatus();
    this.loadData(); // Load all necessary data
  },
  methods: {
    // API connection check (keep as is)
    async checkApiConnection() {
      try {
        const result = await api.testConnection();
        this.connectionStatus = result.status === 'ok' ? 'connected' : 'error';
        if (this.connectionStatus === 'connected') {
          setTimeout(() => { this.connectionStatus = null; }, 3000);
        }
      } catch (error) {
        this.connectionStatus = 'error';
        console.error('API connection test failed:', error);
      }
    },

    // Load all necessary data
    async loadData() {
        // Run in parallel
       await Promise.all([
           this.loadInventory(),
           this.loadTechnicianInventory(),
           this.loadTechnicians()
       ]);
       // Initial filter after data loaded
       this.filterInventoryItems();
    },

    // --- Inventory Tab Methods (Kept UNCHANGED) ---
    async loadInventory() {
      this.loading.inventory = true;
      this.error.inventory = null;
      try {
        this.inventory = await api.getInventory(); // Assumes api.js has getInventory
        console.log("Inventory loaded:", this.inventory.length, "items");
      } catch (error) {
        console.error('Error loading inventory:', error);
        this.error.inventory = `Failed to load inventory: ${error.message}`;
      } finally {
        this.loading.inventory = false;
      }
    },
    viewInventoryDetails(item) {
      this.showInventoryCreateForm = false;
      this.editingInventory = null;
      this.selectedInventory = item;
    },
    editInventory(item) {
      this.selectedInventory = null;
      this.editingInventory = { ...item }; // Use spread to avoid direct mutation
      this.inventoryForm = { ...item };
      this.showInventoryCreateForm = true;
    },
    editFromDetails(item) {
      this.selectedInventory = null;
      // Use nextTick or setTimeout to ensure modal closes before opening edit form
       this.$nextTick(() => {
            this.editingInventory = { ...item };
            this.inventoryForm = { ...item };
            this.showInventoryCreateForm = true;
       });
    },
     async saveInventory() {
      try {
        const payload = {
          name: this.inventoryForm.ItemName,
          quantity: this.inventoryForm.Item_Quantity,
          itemDesc: this.inventoryForm.Item_Desc
        };

        if (this.editingInventory) {
           // Make sure SKU_Number is correctly referenced if needed in the payload or URL
          await api.fetchData(`/inventory/${this.editingInventory.SKU_Number}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) // Send standardized payload
          });
        } else {
          // Adjust payload keys if POST expects different names
          const postPayload = {
              itemName: this.inventoryForm.ItemName,
              itemDesc: this.inventoryForm.Item_Desc,
              itemQuantity: this.inventoryForm.Item_Quantity
          };
          await api.fetchData('/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postPayload)
          });
        }
        await this.loadInventory(); // Reload inventory list
        this.cancelInventoryForm(); // Close form
      } catch (error) {
        console.error('Error saving inventory:', error);
        alert(`Error saving inventory: ${error?.message || error}`);
      }
    },
    async deleteInventory(sku) {
      if (confirm('Are you sure you want to delete this inventory item? This might affect related records.')) {
        try {
          await api.fetchData(`/inventory/${sku}`, { method: 'DELETE' });
          await this.loadInventory(); // Refresh list
        } catch (error) {
          console.error('Error deleting inventory:', error);
          alert(`Error deleting inventory: ${error?.message || error}`);
        }
      }
    },
    cancelInventoryForm() {
      this.editingInventory = null;
      this.showInventoryCreateForm = false;
      this.selectedInventory = null; // Ensure details modal also closes
      this.inventoryForm = { ItemName: '', Item_Desc: '', Item_Quantity: 0 }; // Reset form
    },
    // --- End Inventory Tab Methods ---

    // --- Technician Inventory Methods (Modified) ---
    async loadTechnicianInventory() {
      this.loading.technicianInventory = true;
      this.error.technicianInventory = null;
      try {
        // API MUST return Quantity along with other fields
        this.technicianInventory = await api.fetchData('/techinventory');
        console.log("Tech inventory loaded:", this.technicianInventory.length, "items");
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
        this.technicians = await api.getTechnicians(); // Assumes api.js has getTechnicians
        console.log("Technicians loaded:", this.technicians.length);
      } catch (error) {
        console.error('Error loading technicians:', error);
        this.error.technicians = `Failed to load technicians: ${error.message}`;
      } finally {
        this.loading.technicians = false;
      }
    },

    // Removed: editTechInventory, saveTechInventory, deleteTechInventory, cancelTechInventoryForm

    // --- Bulk Assignment Methods (Kept UNCHANGED from your code) ---
     isItemSelected(skuNumber) {
      return this.bulkAssignForm.selectedItems.includes(skuNumber);
    },

     initializeQuantity(skuNumber) {
       // Initialize quantity when item is selected, default to 1 if not set
       if (this.isItemSelected(skuNumber) && !(skuNumber in this.bulkAssignForm.quantities)) {
          this.$set(this.bulkAssignForm.quantities, skuNumber, 1);
       } else if (!this.isItemSelected(skuNumber)) {
         // Remove quantity when deselected
         this.$delete(this.bulkAssignForm.quantities, skuNumber);
       }
     },

     filterInventoryItems() {
         if (!this.inventory) {
             this.filteredInventoryItems = [];
             return;
         }

         const query = this.itemSearchQuery.toLowerCase().trim();
         if (!query) {
             this.filteredInventoryItems = [...this.inventory]; // Show all if no query
         } else {
             this.filteredInventoryItems = this.inventory.filter(item => {
                 // Safe property access and checking
                 const nameMatch = item.ItemName && item.ItemName.toLowerCase().includes(query);
                 const skuMatch = item.SKU_Number && item.SKU_Number.toString().toLowerCase().includes(query);
                 const descMatch = item.Item_Desc && item.Item_Desc.toLowerCase().includes(query);
                 return nameMatch || skuMatch || descMatch;
             });
         }
         console.log("Filtered inventory items:", this.filteredInventoryItems.length);

          // Clean up quantities map: remove entries for items not currently selected
          const currentSelection = new Set(this.bulkAssignForm.selectedItems);
          Object.keys(this.bulkAssignForm.quantities).forEach(sku => {
              if (!currentSelection.has(sku)) {
                   this.$delete(this.bulkAssignForm.quantities, sku);
              }
          });
           // Also remove selected items if they are no longer in the filtered list
            this.bulkAssignForm.selectedItems = this.bulkAssignForm.selectedItems.filter(sku =>
                this.filteredInventoryItems.some(item => item.SKU_Number === sku)
            );

     },

     toggleAllItems() {
         const allVisibleSelected = this.allItemsSelected; // Current state

         if (allVisibleSelected) {
             // Deselect all currently visible items
             const visibleSkus = new Set(this.filteredInventoryItems.map(item => item.SKU_Number));
             this.bulkAssignForm.selectedItems = this.bulkAssignForm.selectedItems.filter(sku => !visibleSkus.has(sku));
             this.filteredInventoryItems.forEach(item => {
                 this.$delete(this.bulkAssignForm.quantities, item.SKU_Number);
             });
         } else {
             // Select all currently visible items that aren't already selected
             const currentSelection = new Set(this.bulkAssignForm.selectedItems);
             this.filteredInventoryItems.forEach(item => {
                 if (!currentSelection.has(item.SKU_Number)) {
                     this.bulkAssignForm.selectedItems.push(item.SKU_Number);
                      // Initialize quantity only if it doesn't exist
                      if (!(item.SKU_Number in this.bulkAssignForm.quantities)) {
                            this.$set(this.bulkAssignForm.quantities, item.SKU_Number, 1); // Default to 1
                      }
                 }
             });
         }
     },

    async saveBulkAssignment() {
      if (!this.bulkAssignForm.technicianId || this.bulkAssignForm.selectedItems.length === 0) {
        alert("Please select a technician and at least one item.");
        return;
      }

      this.processingBulkAssign = true;
      const techId = this.bulkAssignForm.technicianId;
      const itemsToAssign = this.bulkAssignForm.selectedItems.map(sku => ({
          skuNumber: sku,
          techId: techId,
          quantity: this.bulkAssignForm.quantities[sku] || 1 // Default to 1 if somehow unset
      }));

      console.log(`Starting bulk assignment of ${itemsToAssign.length} items to technician ${techId}`);

      // Validate quantities before sending
       let validationPassed = true;
       const inventoryMap = new Map(this.inventory.map(item => [item.SKU_Number, item.Item_Quantity]));

        itemsToAssign.forEach(assignment => {
            const available = inventoryMap.get(assignment.skuNumber);
            if (assignment.quantity < 1 || assignment.quantity > available) {
                alert(`Invalid quantity (${assignment.quantity}) for item SKU ${assignment.skuNumber}. Available: ${available}. Minimum: 1.`);
                validationPassed = false;
            }
        });

        if (!validationPassed) {
            this.processingBulkAssign = false;
            return; // Stop if validation fails
        }

       // Use Promise.allSettled to handle individual errors gracefully
      try {
        const results = await Promise.allSettled(itemsToAssign.map(item =>
          api.fetchData('/techinventory', { // Ensure this endpoint handles quantity
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item) // Send skuNumber, techId, quantity
          })
        ));

        const successes = results.filter(r => r.status === 'fulfilled');
        const failures = results.filter(r => r.status === 'rejected');

        let message = `Bulk assignment finished.\n${successes.length} items assigned successfully.`;
        if (failures.length > 0) {
          message += `\n${failures.length} items failed:`;
          failures.forEach(fail => {
             // Attempt to get SKU from original item data if possible, otherwise log the reason
             // This requires finding the original item payload based on the rejected promise index or similar strategy
             // For simplicity here, just logging the reason:
             console.error("Assignment Error:", fail.reason);
             message += `\n - ${fail.reason?.message || 'Unknown error'}`;
          });
        }
        alert(message);

        await this.loadTechnicianInventory(); // Refresh the list
        this.cancelBulkAssignForm(); // Close and reset the form

      } catch (error) {
        // Catch errors not related to individual API calls (e.g., network error before sending)
        console.error('Error during bulk assignment process:', error);
        alert(`A general error occurred during bulk assignment: ${error.message}`);
      } finally {
        this.processingBulkAssign = false;
      }
    },

    checkAdminStatus() {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      this.isAdmin = isAdmin;
      console.log("User admin status:", this.isAdmin);
    },

     cancelBulkAssignForm() {
         this.showBulkAssignForm = false;
         this.bulkAssignForm = {
             technicianId: '',
             selectedItems: [],
             quantities: {}
         };
         this.itemSearchQuery = ''; // Reset search
         this.filterInventoryItems(); // Reset filter
     },
    // --- End Bulk Assignment Methods ---
  }
};
</script>

<style scoped>
/* Styles remain UNCHANGED from your original code */
/* Add some z-index handling for modals */
.modal {
  z-index: 1000;
}

/* Add transitions for smoother modal handling */
.modal-content {
  transition: all 0.3s ease;
}
/* New styles for bulk assignment */
.bulk-assign-btn {
  margin-left: 1rem;
  background-color: #2c3e50; /* Darker button for distinction */
  color: white;
}
.bulk-assign-btn:hover {
    background-color: #3a506b;
}

.inventory-items-list {
  max-height: 300px; /* Adjust as needed */
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: #fdfdfd;
}

.search-box {
  margin-bottom: 0.75rem;
  position: sticky; /* Keep search bar visible */
  top: -8px; /* Adjust based on padding */
  background-color: #fdfdfd; /* Match list background */
  padding-top: 8px;
  padding-bottom: 4px;
  z-index: 10; /* Ensure it stays above list items */
}

.search-box input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Include padding in width */
}

.select-all {
  display: block;
  padding: 0.5rem 0;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.5rem;
  cursor: pointer;
}
.select-all input {
    margin-right: 5px;
}

.items-container {
  /* Using flexbox for potentially better wrapping control */
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-checkbox {
  padding: 0.3rem 0.5rem;
  border-radius: 3px;
  border: 1px solid transparent; /* Placeholder for hover */
  flex-basis: calc(50% - 0.25rem); /* Adjust for 2 columns, minus half gap */
  box-sizing: border-box;
}
.item-checkbox label {
    display: block; /* Ensure label takes full width */
    cursor: pointer;
}

.item-checkbox:hover {
  background-color: #f0f4f8;
  border-color: #e0e4e8;
}

.selected-count {
  margin: 1rem 0;
  font-weight: bold;
  color: #2c3e50;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .items-container {
     /* Switch to single column on smaller screens */
     flex-direction: column;
     gap: 0.25rem;
  }
   .item-checkbox {
       flex-basis: 100%; /* Full width */
   }
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem; /* Add space between text/checkbox and quantity */
}
.item-row span { /* Container for checkbox and text */
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 1; /* Allow text to take available space */
    word-break: break-word; /* Prevent long names from overflowing badly */
}


.quantity-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* flex-shrink: 0; Prevent quantity input from shrinking */
}

.quantity-input input[type="number"] {
  width: 60px; /* Fixed width for quantity */
  padding: 0.25rem 0.4rem;
  border: 1px solid #ccc;
  border-radius: 3px;
  text-align: right;
  box-sizing: border-box;
}
/* Hide spinner buttons on number input for cleaner look */
.quantity-input input[type=number]::-webkit-outer-spin-button,
.quantity-input input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.quantity-input input[type=number] {
  -moz-appearance: textfield; /* Firefox */
}


.quantity-input label {
  font-size: 0.9em;
  color: #555;
  margin: 0; /* Reset margin */
  padding: 0; /* Reset padding */
}

/* Standard button styles from your original CSS (assuming they exist) */
.create-btn, .btn-view, .btn-edit, .btn-delete, .btn-save, .btn-cancel {
  /* Make sure these have common base styles */
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  margin-right: 5px;
  font-size: 0.9em;
}
/* ... Add specific colors/borders for each button type if not already defined ... */

</style>