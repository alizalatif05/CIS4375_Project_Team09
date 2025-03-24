<!-- views/AdminOperationsPage.vue -->
<template>
  <div class="admin-page">
    <h1>Admin Operations</h1>

    <div class="connection-status" v-if="connectionStatus">
      <span :class="connectionStatusClass">{{ connectionStatusMessage }}</span>
    </div>

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'technicians' }"
        @click="activeTab = 'technicians'"
      >
        Technician Management
      </button>
      <button
        :class="{ active: activeTab === 'salesreps' }"
        @click="activeTab = 'salesreps'"
      >
        Sales Representatives
      </button>
      <button
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        User Management
      </button>
    </div>

    <!-- Technicians Tab -->
    <div v-if="activeTab === 'technicians'" class="tab-content">
      <div class="actions">
        <button @click="showTechCreateForm = true" class="create-btn">
          Add New Technician
        </button>
      </div>

      <div class="data-table">
        <h2>Technicians</h2>
        <div v-if="loading.technicians" class="loading">Loading technicians...</div>
        <div v-else-if="error.technicians" class="error-message">
          {{ error.technicians }}
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tech in technicians" :key="tech.TechID">
              <td>{{ tech.TechID }}</td>
              <td>{{ tech.Tech_fName }}</td>
              <td>{{ tech.Tech_lName }}</td>
              <td>
                <span :class="['status-badge', tech.Deleted === 'No' ? 'active' : 'inactive']">
                  {{ tech.Deleted === 'No' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button @click="viewTechnicianDetails(tech)" class="btn-view">
                  View
                </button>
                <button @click="editTechnician(tech)" class="btn-edit">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Technician Form Modal -->
      <div v-if="showTechCreateForm || editingTech" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingTech ? 'Edit Technician' : 'Add New Technician' }}</h3>
            <button @click="cancelTechForm" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTechnician">
              <div class="form-group">
                <label>First Name:</label>
                <input v-model="techForm.Tech_fName" required />
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model="techForm.Tech_lName" required />
              </div>
              <div class="form-group">
                <label>User:</label>
                <select v-model="techForm.UserID" required>
                  <option value="">Select a User</option>
                  <option v-for="user in availableUsers" :key="user.UserID" :value="user.UserID">
                    {{ user.User_fName }} {{ user.User_lName }} ({{ user.Username }})
                  </option>
                </select>
              </div>
              <div v-if="editingTech" class="form-group">
                <label>Status:</label>
                <select v-model="techForm.Deleted">
                  <option value="No">Active</option>
                  <option value="Yes">Inactive</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" @click="cancelTechForm" class="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Technician Details Modal -->
      <div v-if="selectedTech" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Technician Details</h3>
            <button @click="selectedTech = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-section">
              <p><strong>ID:</strong> {{ selectedTech.TechID }}</p>
              <p><strong>Name:</strong> {{ selectedTech.Tech_fName }} {{ selectedTech.Tech_lName }}</p>
              <p><strong>Status:</strong> {{ selectedTech.Deleted === 'No' ? 'Active' : 'Inactive' }}</p>
            </div>
            <div class="form-actions">
              <button @click="editTechnician(selectedTech)" class="btn-edit">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Reps Tab -->
    <div v-if="activeTab === 'salesreps'" class="tab-content">
      <div class="actions">
        <button @click="showRepCreateForm = true" class="create-btn">
          Add New Sales Rep
        </button>
      </div>

      <div class="data-table">
        <h2>Sales Representatives</h2>
        <div v-if="loading.salesReps" class="loading">Loading sales representatives...</div>
        <div v-else-if="error.salesReps" class="error-message">
          {{ error.salesReps }}
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rep in salesReps" :key="rep.SalesRepID">
              <td>{{ rep.SalesRepID }}</td>
              <td>{{ rep.SalesRep_fName }}</td>
              <td>{{ rep.SalesRep_lName }}</td>
              <td>
                <span :class="['status-badge', rep.Deleted === 'No' ? 'active' : 'inactive']">
                  {{ rep.Deleted === 'No' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button @click="viewSalesRepDetails(rep)" class="btn-view">
                  View
                </button>
                <button @click="editSalesRep(rep)" class="btn-edit">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sales Rep Form Modal -->
      <div v-if="showRepCreateForm || editingRep" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingRep ? 'Edit Sales Rep' : 'Add New Sales Rep' }}</h3>
            <button @click="cancelRepForm" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSalesRep">
              <div class="form-group">
                <label>First Name:</label>
                <input v-model="repForm.SalesRep_fName" required />
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model="repForm.SalesRep_lName" required />
              </div>
              <div class="form-group">
                <label>User:</label>
                <select v-model="repForm.UserID" required>
                  <option value="">Select a User</option>
                  <option v-for="user in availableUsers" :key="user.UserID" :value="user.UserID">
                    {{ user.User_fName }} {{ user.User_lName }} ({{ user.Username }})
                  </option>
                </select>
              </div>
              <div v-if="editingRep" class="form-group">
                <label>Status:</label>
                <select v-model="repForm.Deleted">
                  <option value="No">Active</option>
                  <option value="Yes">Inactive</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" @click="cancelRepForm" class="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sales Rep Details Modal -->
      <div v-if="selectedRep" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Sales Rep Details</h3>
            <button @click="selectedRep = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-section">
              <p><strong>ID:</strong> {{ selectedRep.SalesRepID }}</p>
              <p><strong>Name:</strong> {{ selectedRep.SalesRep_fName }} {{ selectedRep.SalesRep_lName }}</p>
              <p><strong>Status:</strong> {{ selectedRep.Deleted === 'No' ? 'Active' : 'Inactive' }}</p>
            </div>
            <div class="form-actions">
              <button @click="editSalesRep(selectedRep)" class="btn-edit">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="actions">
        <button @click="showUserCreateForm = true" class="create-btn">
          Add New User
        </button>
      </div>

      <div class="data-table">
        <h2>Users</h2>
        <div v-if="loading.users" class="loading">Loading users...</div>
        <div v-else-if="error.users" class="error-message">
          {{ error.users }}
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.UserID">
              <td>{{ user.UserID }}</td>
              <td>{{ user.User_fName }}</td>
              <td>{{ user.User_lName }}</td>
              <td>{{ user.Username }}</td>
              <td>{{ user.User_Type }}</td>
              <td>
                <span :class="['status-badge', user.Deleted === 'no' ? 'active' : 'inactive']">
                  {{ user.Deleted === 'no' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button @click="viewUserDetails(user)" class="btn-view">
                  View
                </button>
                <button @click="editUser(user)" class="btn-edit">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- User Form Modal -->
      <div v-if="showUserCreateForm || editingUser" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Edit User' : 'Add New User' }}</h3>
            <button @click="cancelUserForm" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="form-group">
                <label>First Name:</label>
                <input v-model="userForm.User_fName" required />
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model="userForm.User_lName" required />
              </div>
              <div class="form-group">
                <label>Username:</label>
                <input v-model="userForm.Username" required />
              </div>
              <div v-if="!editingUser" class="form-group">
                <label>Password:</label>
                <input type="password" v-model="userForm.UserPassword" required />
              </div>
              <div v-else class="form-group">
                <label>New Password (leave blank to keep current):</label>
                <input type="password" v-model="userForm.UserPassword" />
              </div>
              <div class="form-group">
                <label>User Type:</label>
                <select v-model="userForm.User_Type" required>
                  <option value="admin">Admin</option>
                  <option value="technician">Technician</option>
                  <option value="sales">Sales</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
              <div v-if="editingUser" class="form-group">
                <label>Status:</label>
                <select v-model="userForm.Deleted">
                  <option value="no">Active</option>
                  <option value="yes">Inactive</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" @click="cancelUserForm" class="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- User Details Modal -->
      <div v-if="selectedUser" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>User Details</h3>
            <button @click="selectedUser = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-section">
              <p><strong>ID:</strong> {{ selectedUser.UserID }}</p>
              <p><strong>Name:</strong> {{ selectedUser.User_fName }} {{ selectedUser.User_lName }}</p>
              <p><strong>Username:</strong> {{ selectedUser.Username }}</p>
              <p><strong>User Type:</strong> {{ selectedUser.User_Type }}</p>
              <p><strong>Status:</strong> {{ selectedUser.Deleted === 'no' ? 'Active' : 'Inactive' }}</p>
            </div>
            <div class="form-actions">
              <button @click="editUser(selectedUser)" class="btn-edit">Edit</button>
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
      activeTab: 'technicians',
      connectionStatus: null,

      // Loading and error states
      loading: {
        technicians: false,
        salesReps: false,
        users: false
      },
      error: {
        technicians: null,
        salesReps: null,
        users: null
      },

      // Technician data
      technicians: [],
      selectedTech: null,
      editingTech: null,
      showTechCreateForm: false,
      techForm: {
        Tech_fName: '',
        Tech_lName: '',
        UserID: '',
        Deleted: 'No'
      },

      // Sales rep data
      salesReps: [],
      selectedRep: null,
      editingRep: null,
      showRepCreateForm: false,
      repForm: {
        SalesRep_fName: '',
        SalesRep_lName: '',
        UserID: '',
        Deleted: 'No'
      },

      // User data
      users: [],
      selectedUser: null,
      editingUser: null,
      showUserCreateForm: false,
      userForm: {
        User_fName: '',
        User_lName: '',
        Username: '',
        UserPassword: '',
        User_Type: 'standard',
        Deleted: 'no'
      }
    }
  },
  computed: {
    availableUsers() {
      return this.users.filter(user => user.Deleted === 'no');
    },
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
      this.loadUsers();
      this.loadTechnicians();
      this.loadSalesReps();
    },

    // User data methods
    async loadUsers() {
      this.loading.users = true;
      this.error.users = null;

      try {
        this.users = await api.getUsers();
      } catch (error) {
        console.error('Error loading users:', error);
        this.error.users = `Failed to load users: ${error.message}`;
      } finally {
        this.loading.users = false;
      }
    },

    viewUserDetails(user) {
      this.selectedUser = user;
    },

    editUser(user) {
      this.editingUser = user;
      // Create a copy of the user data for editing
      const userCopy = { ...user };
      // Don't include password for editing
      delete userCopy.UserPassword;
      this.userForm = userCopy;

      // If a user was being viewed, close the view modal
      this.selectedUser = null;
    },

    async saveUser() {
      try {
        if (this.editingUser) {
          // If password field is empty, remove it to avoid updating password
          if (!this.userForm.UserPassword) {
            delete this.userForm.UserPassword;
          }

          await api.updateUser(this.editingUser.UserID, this.userForm);

          // Refresh the users list
          await this.loadUsers();
        } else {
          await api.createUser(this.userForm);

          // Refresh the users list
          await this.loadUsers();
        }

        this.cancelUserForm();
      } catch (error) {
        console.error('Error saving user:', error);
        alert(`Error saving user: ${error.message}`);
      }
    },

    cancelUserForm() {
      this.editingUser = null;
      this.showUserCreateForm = false;
      this.userForm = {
        User_fName: '',
        User_lName: '',
        Username: '',
        UserPassword: '',
        User_Type: 'standard',
        Deleted: 'no'
      };
    },

    // Technician data methods
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

    viewTechnicianDetails(tech) {
      this.selectedTech = tech;
    },

    editTechnician(tech) {
      this.editingTech = tech;
      this.techForm = { ...tech };

      // If a technician was being viewed, close the view modal
      this.selectedTech = null;
    },

    async saveTechnician() {
      try {
        if (this.editingTech) {
          await api.updateTechnician(this.editingTech.TechID, this.techForm);
        } else {
          await api.createTechnician(this.techForm);
        }

        // Refresh the technicians list
        await this.loadTechnicians();
        this.cancelTechForm();
      } catch (error) {
        console.error('Error saving technician:', error);
        alert(`Error saving technician: ${error.message}`);
      }
    },

    cancelTechForm() {
      this.editingTech = null;
      this.showTechCreateForm = false;
      this.techForm = {
        Tech_fName: '',
        Tech_lName: '',
        UserID: '',
        Deleted: 'No'
      };
    },

    // Sales rep data methods
    async loadSalesReps() {
      this.loading.salesReps = true;
      this.error.salesReps = null;

      try {
        this.salesReps = await api.getSalesReps();
      } catch (error) {
        console.error('Error loading sales reps:', error);
        this.error.salesReps = `Failed to load sales representatives: ${error.message}`;
      } finally {
        this.loading.salesReps = false;
      }
    },

    viewSalesRepDetails(rep) {
      this.selectedRep = rep;
    },

    editSalesRep(rep) {
      this.editingRep = rep;
      this.repForm = { ...rep };

      // If a sales rep was being viewed, close the view modal
      this.selectedRep = null;
    },

    async saveSalesRep() {
      try {
        if (this.editingRep) {
          await api.updateSalesRep(this.editingRep.SalesRepID, this.repForm);
        } else {
          await api.createSalesRep(this.repForm);
        }

        // Refresh the sales reps list
        await this.loadSalesReps();
        this.cancelRepForm();
      } catch (error) {
        console.error('Error saving sales rep:', error);
        alert(`Error saving sales representative: ${error.message}`);
      }
    },

    cancelRepForm() {
      this.editingRep = null;
      this.showRepCreateForm = false;
      this.repForm = {
        SalesRep_fName: '',
        SalesRep_lName: '',
        UserID: '',
        Deleted: 'No'
      };
    }
  }
}
</script>
