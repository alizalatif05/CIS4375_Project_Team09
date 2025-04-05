<template>
  <div class="admin-page">
    <h1>Admin Dashboard</h1>

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
              <th>User ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tech in technicians" :key="tech.TechID">
              <td>{{ tech.TechID }}</td>
              <td>{{ tech.firstName }}</td>
              <td>{{ tech.lastName }}</td>
              <td>{{ tech.UserID }}</td>
              <td>
                <button @click="editTechnician(tech)" class="btn-edit">
                  Edit
                </button>
                <button @click="deleteTechnician(tech.TechID)" class="btn-delete">
                  Delete
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
                <input v-model="techForm.firstName" type="text" required />
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model="techForm.lastName" type="text" required />
              </div>
              <div class="form-group">
                <label>User:</label>
                <select v-model="techForm.UserID">
                  <option value="">Select a User</option>
                  <option v-for="user in availableUsers" :key="user.UserID" :value="user.UserID">
                    {{ user.User_fName }} {{ user.User_lName }}
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
        <div v-if="loading.salesReps" class="loading">Loading sales reps...</div>
        <div v-else-if="error.salesReps" class="error-message">
          {{ error.salesReps }}
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>User ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rep in salesReps" :key="rep.SalesRepID">
              <td>{{ rep.SalesRepID }}</td>
              <td>{{ rep.SalesRep_fName }}</td>
              <td>{{ rep.SalesRep_lName }}</td>
              <td>{{ rep.UserID }}</td>
              <td>
                <button @click="editSalesRep(rep)" class="btn-edit">
                  Edit
                </button>
                <button @click="deleteSalesRep(rep.SalesRepID)" class="btn-delete">
                  Delete
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
                <input v-model="repForm.SalesRep_fName" type="text" required />
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model="repForm.SalesRep_lName" type="text" required />
              </div>
              <div class="form-group">
                <label>User:</label>
                <select v-model="repForm.UserID">
                  <option value="">Select a User</option>
                  <option v-for="user in availableUsers" :key="user.UserID" :value="user.UserID">
                    {{ user.User_fName }} {{ user.User_lName }}
                  </option>
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
              <td>{{ user.UserType }}</td>
              <td>
                <span :class="['status-badge', user.Deleted === 'No' ? 'active' : 'inactive']">
                  {{ user.Deleted === 'No' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button @click="editUser(user)" class="btn-edit">
                  Edit
                </button>
                <button @click="deleteUser(user.UserID)" class="btn-delete">
                  Delete
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
                <input v-model="userForm.User_fName" type="text" required />
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model="userForm.User_lName" type="text" required />
              </div>
              <div class="form-group">
                <label>Username:</label>
                <input v-model="userForm.Username" type="text" required />
              </div>
              <div v-if="!editingUser" class="form-group">
                <label>Password:</label>
                <input v-model="userForm.UserPassword" type="password" required />
              </div>
              <div v-else class="form-group">
                <label>New Password (leave blank to keep current):</label>
                <input v-model="userForm.UserPassword" type="password" />
              </div>
              <div class="form-group">
                <label>User Type:</label>
                <select v-model="userForm.UserType" required>
                  <option value="admin">Admin</option>
                  <option value="technician">Technician</option>
                  <option value="sales">Sales</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
              <div v-if="editingUser" class="form-group">
                <label>Status:</label>
                <select v-model="userForm.Deleted">
                  <option value="No">Active</option>
                  <option value="Yes">Inactive</option>
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
    </div>
  </div>
</template>

<script>
import "@/assets/css/style.css";
import api from '../../services/api.js';

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

      // Data
      technicians: [],
      salesReps: [],
      users: [],

      // UI State
      editingTech: null,
      showTechCreateForm: false,
      editingRep: null,
      showRepCreateForm: false,
      editingUser: null,
      showUserCreateForm: false,

      // Forms
      techForm: {
        firstName: '',
        lastName: '',
        UserID: '',
        Deleted: 'No'
      },
      repForm: {
        SalesRep_fName: '',
        SalesRep_lName: '',
        UserID: ''
      },
      userForm: {
        User_fName: '',
        User_lName: '',
        Username: '',
        UserPassword: '',
        UserType: 'standard',
        Deleted: 'No'
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
    availableUsers() {
      return this.users.filter(user => user.Deleted === 'No');
    }
  },
  created() {
    this.checkApiConnection();
    this.loadData();
  },
  // Updated methods for AdminOperations.vue
// Replace the methods section in your AdminOperations.vue file

methods: {
  // API connection check
  async checkApiConnection() {
    try {
      const result = await api.testConnection();
      this.connectionStatus = result.status === 'ok' ? 'connected' : 'error';
      console.log('API connection status:', this.connectionStatus);

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
    await this.loadUsers();
    await this.loadTechnicians();
    await this.loadSalesReps();
  },

  // User methods
  async loadUsers() {
    this.loading.users = true;
    this.error.users = null;
    try {
      console.log('Loading users...');
      this.users = await api.getUsers();
      console.log('Users loaded:', this.users.length);
    } catch (error) {
      console.error('Error loading users:', error);
      this.error.users = `Failed to load users: ${error.message}`;
    } finally {
      this.loading.users = false;
    }
  },

  // Technician methods
  async loadTechnicians() {
    this.loading.technicians = true;
    this.error.technicians = null;
    try {
      console.log('Loading technicians...');
      this.technicians = await api.getTechnicians();
      console.log('Technicians loaded:', this.technicians.length);
    } catch (error) {
      console.error('Error loading technicians:', error);
      this.error.technicians = `Failed to load technicians: ${error.message}`;
    } finally {
      this.loading.technicians = false;
    }
  },

  // Sales Rep methods
  async loadSalesReps() {
    this.loading.salesReps = true;
    this.error.salesReps = null;
    try {
      console.log('Loading sales reps...');
      this.salesReps = await api.getSalesReps();
      console.log('Sales reps loaded:', this.salesReps.length);
    } catch (error) {
      console.error('Error loading sales reps:', error);
      this.error.salesReps = `Failed to load sales reps: ${error.message}`;
    } finally {
      this.loading.salesReps = false;
    }
  },

  // The rest of your existing methods...
  editUser(user) {
    this.editingUser = user;
    this.userForm = {
      User_fName: user.User_fName,
      User_lName: user.User_lName,
      Username: user.Username,
      UserPassword: '', // Don't pre-fill password
      UserType: user.UserType,
      Deleted: user.Deleted
    };
    this.showUserCreateForm = true;
  },

  async saveUser() {
    try {
      // Prepare user data with correct field names
      const userData = {
        User_fName: this.userForm.User_fName,
        User_lName: this.userForm.User_lName,
        Username: this.userForm.Username,
        UserPassword: this.userForm.UserPassword,
        UserType: this.userForm.UserType,
        Deleted: this.userForm.Deleted
      };

      if (this.editingUser) {
        // Remove password if empty to avoid updating with empty string
        if (!userData.UserPassword) {
          const { UserPassword, ...updateData } = userData;
          await api.updateUser(this.editingUser.UserID, updateData);
        } else {
          await api.updateUser(this.editingUser.UserID, userData);
        }
      } else {
        await api.createUser(userData);
      }
      await this.loadUsers();
      this.cancelUserForm();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Error saving user: ${error.message}`);
    }
  },

  async deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        await this.loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Error deleting user: ${error.message}`);
      }
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
      UserType: 'standard',
      Deleted: 'No'
    };
  },

  editTechnician(tech) {
    this.editingTech = tech;
    this.techForm = {
      firstName: tech.firstName,
      lastName: tech.lastName,
      UserID: tech.UserID,
      Deleted: tech.Deleted || 'No'
    };
    this.showTechCreateForm = true;
  },

  async saveTechnician() {
    try {
      const techData = {
        Tech_fName: this.techForm.firstName,
        Tech_lName: this.techForm.lastName,
        UserID: this.techForm.UserID || null,
        Deleted: this.techForm.Deleted || 'No'
      };

      if (this.editingTech) {
        await api.updateTechnician(this.editingTech.TechID, techData);
      } else {
        await api.createTechnician(techData);
      }
      await this.loadTechnicians();
      this.cancelTechForm();
    } catch (error) {
      console.error('Error saving technician:', error);
      alert(`Error saving technician: ${error.message}`);
    }
  },

  async deleteTechnician(techId) {
    if (confirm('Are you sure you want to delete this technician?')) {
      try {
        await api.deleteTechnician(techId);
        await this.loadTechnicians();
      } catch (error) {
        console.error('Error deleting technician:', error);
        alert(`Error deleting technician: ${error.message}`);
      }
    }
  },

  cancelTechForm() {
    this.editingTech = null;
    this.showTechCreateForm = false;
    this.techForm = {
      firstName: '',
      lastName: '',
      UserID: '',
      Deleted: 'No'
    };
  },

  editSalesRep(rep) {
    this.editingRep = rep;
    this.repForm = {
      SalesRep_fName: rep.SalesRep_fName,
      SalesRep_lName: rep.SalesRep_lName,
      UserID: rep.UserID,
      Deleted: rep.Deleted || 'No'
    };
    this.showRepCreateForm = true;
  },

  async saveSalesRep() {
    try {
      const repData = {
        SalesRep_fName: this.repForm.SalesRep_fName,
        SalesRep_lName: this.repForm.SalesRep_lName,
        UserID: this.repForm.UserID || null,
        Deleted: this.repForm.Deleted || 'No'
      };

      if (this.editingRep) {
        await api.updateSalesRep(this.editingRep.SalesRepID, repData);
      } else {
        await api.createSalesRep(repData);
      }
      await this.loadSalesReps();
      this.cancelRepForm();
    } catch (error) {
      console.error('Error saving sales rep:', error);
      alert(`Error saving sales rep: ${error.message}`);
    }
  },

  async deleteSalesRep(repId) {
    if (confirm('Are you sure you want to delete this sales rep?')) {
      try {
        await api.deleteSalesRep(repId);
        await this.loadSalesReps();
      } catch (error) {
        console.error('Error deleting sales rep:', error);
        alert(`Error deleting sales rep: ${error.message}`);
      }
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
};
</script>
