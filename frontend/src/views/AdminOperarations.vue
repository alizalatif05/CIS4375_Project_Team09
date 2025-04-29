<template>

  <div class="admin-page">
    <h1>Admin Dashboard</h1>

    <!--Checks connection status-->
    <div class="connection-status" v-if="connectionStatus">
      <span :class="connectionStatusClass">{{ connectionStatusMessage }}</span>
    </div>

    <!-- 3 tabs -->
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'technicians' }"
        @click="activeTab = 'technicians'"
      >
        All Technicians
      </button>
      <button
        :class="{ active: activeTab === 'salesreps' }"
        @click="activeTab = 'salesreps'"
      >
       All Sales Representatives
      </button>
      <button
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        User Profile Management
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

  <!-- Users Tab Heading-->
  <div v-if="activeTab === 'users'" class="tab-content">
  <div class="actions">
    <button @click="showUserCreateForm = true" class="create-btn">
      Add New User
    </button>


    <div class="filter-controls">
      <label class="filter-label">
        <input type="checkbox" v-model="showInactiveUsers" @change="applyUserFilters">
        Show Inactive Users
      </label>
      <div class="search-box">
        <input
          type="text"
          v-model="userSearchQuery"
          placeholder="Search users..."
          @input="applyUserFilters"
        />
      </div>
    </div>
  </div>

  <!--User Tab-->
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
        <tr v-for="user in filteredUsers" :key="user.UserID">
          <td>{{ user.UserID }}</td>
          <td>{{ user.User_fName }}</td>
          <td>{{ user.User_lName }}</td>
          <td>{{ user.Username }}</td>
          <td>{{ user.UserType }}</td>
          <td>
            <!-- Replace static badge with toggleable switch -->
            <div class="status-toggle">
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="user.Deleted === 'No'"
                  @change="toggleUserStatus(user)"
                >
                <span class="slider round"></span>
              </label>
              <span :class="['status-label', user.Deleted === 'No' ? 'active' : 'inactive']">
                {{ user.Deleted === 'No' ? 'Active' : 'Inactive' }}
              </span>
            </div>
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

      showInactiveUsers: true, // Show inactive users along with active (for admins only)
      userSearchQuery: '',
      filteredUsers: [],

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

    // Initialize filtered users
    this.applyUserFilters();
  } catch (error) {
    console.error('Error loading users:', error);
    this.error.users = `Failed to load users: ${error.message}`;
  } finally {
    this.loading.users = false;
  }
},

  // User filtering and toggling
applyUserFilters() {
  if (!this.users) {
    this.filteredUsers = [];
    return;
  }

  let result = [...this.users];

  // Filter by active/inactive status
  if (!this.showInactiveUsers) {
    result = result.filter(user => user.Deleted === 'No');
  }

  // Filter by search query
  if (this.userSearchQuery.trim()) {
    const query = this.userSearchQuery.toLowerCase();
    result = result.filter(user =>
      (user.User_fName && user.User_fName.toLowerCase().includes(query)) ||
      (user.User_lName && user.User_lName.toLowerCase().includes(query)) ||
      (user.Username && user.Username.toLowerCase().includes(query)) ||
      (user.UserType && user.UserType.toLowerCase().includes(query))
    );
  }

  this.filteredUsers = result;
},

async toggleUserStatus(user) {
  try {
    const updatedUser = {
      User_fName: user.User_fName,
      User_lName: user.User_lName,
      Username: user.Username,
      UserType: user.UserType,
      Deleted: user.Deleted === 'No' ? 'Yes' : 'No' // Toggle the status
    };

    await api.updateUser(user.UserID, updatedUser);

    // Update the local user object to reflect the change
    user.Deleted = updatedUser.Deleted;

    // Show success message
    const status = updatedUser.Deleted === 'No' ? 'activated' : 'deactivated';
    console.log(`User ${user.Username} has been ${status}.`);
  } catch (error) {
    console.error('Error toggling user status:', error);
    alert(`Error changing user status: ${error.message}`);

  // Revert the visual change
    this.loadUsers();
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


  editUser(user) {
    this.editingUser = user;
    this.userForm = {
      User_fName: user.User_fName,
      User_lName: user.User_lName,
      Username: user.Username,
      UserPassword: '',
      UserType: user.UserType,
      Deleted: user.Deleted
    };
    this.showUserCreateForm = true;
  },

  async saveUser() {
    try {
      const userData = {
        User_fName: this.userForm.User_fName,
        User_lName: this.userForm.User_lName,
        Username: this.userForm.Username,
        UserPassword: this.userForm.UserPassword,
        UserType: this.userForm.UserType,
        Deleted: this.userForm.Deleted
      };

      if (this.editingUser) {
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


<style scoped>

/* Filter controls */
.filter-controls {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.search-box {
  flex-grow: 1;
  max-width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Toggle switch */
.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.status-label {
  font-size: 0.9rem;
  font-weight: 500;
}

.status-label.active {
  color: #4CAF50;
}

.status-label.inactive {
  color: #F44336;
}
</style>
