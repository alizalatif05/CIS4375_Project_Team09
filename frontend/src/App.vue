<template>
  <div class="app-container">
    <header class="main-header">
      <div class="logo-container">
        <img src="@/assets/Militia Protection Logo.png" alt="Militia Protection Logo" class="logo" />
      </div>
      
      <nav class="main-nav">
        <div v-if="isAuthenticated" class="nav-links">
          <router-link to="/home" class="nav-link">
            <i class="fas fa-home"></i> Home
          </router-link>
          <router-link to="/inventory" class="nav-link">
            <i class="fas fa-boxes"></i> Inventory
          </router-link>
          <router-link to="/customers" class="nav-link">
            <i class="fas fa-users"></i> Customers
          </router-link>
          <router-link to="/orders" class="nav-link">
            <i class="fas fa-clipboard-list"></i> Orders
          </router-link>
          
          <!-- Admin-only navigation link -->
          <router-link v-if="isAdmin" to="/admin/admins" class="nav-link admin-link">
            <i class="fas fa-shield-alt"></i> Admin
          </router-link>
        </div>
        
        <!-- User account section -->
        <div v-if="isAuthenticated" class="user-actions">
          <div class="user-info">
            <i class="fas fa-user-circle"></i>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <button @click="logout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isAuthenticated: false,
      isAdmin: false 
    };
  },
  computed: {
    userRole() {
      return this.isAdmin ? 'Administrator' : 'User';
    }
  },
  created() {
    // Check authentication status when component is created
    this.checkAuthStatus();
  },
  methods: {
    checkAuthStatus() {
      const token = localStorage.getItem('token');
      // You might want to add additional token validation here
      this.isAuthenticated = !!token;
      
      // Also check and set admin status
      this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      this.$router.push('/login');
      // Reset authentication status
      this.isAuthenticated = false;
      this.isAdmin = false; // Also reset admin status
    }
  },
  mounted() {
    // Add event listeners for both storage and custom auth-changed event
    window.addEventListener('storage', this.checkAuthStatus);
    window.addEventListener('auth-changed', this.checkAuthStatus);
  },
  beforeUnmount() {
    // Remove both event listeners to prevent memory leaks
    window.removeEventListener('storage', this.checkAuthStatus);
    window.removeEventListener('auth-changed', this.checkAuthStatus);
  }
};
</script>


<style scoped>
/* Global styles */
.app-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header styles */
.main-header {
  background: linear-gradient(to right, #2c3e50, #3498db);
  color: white;
  padding: 0.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo styling */
.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  max-height: 50px;
  margin-right: 1rem;
}

/* Navigation bar */
.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-left: 2rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.admin-link {
  background-color: rgba(231, 76, 60, 0.7);
  border-radius: 4px;
  font-weight: 500;
}

.admin-link:hover {
  background-color: rgba(231, 76, 60, 0.9);
}

/* User section */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.user-role {
  font-size: 0.9rem;
  font-weight: 500;
}

.logout-btn {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    padding: 1rem;
  }
  
  .main-nav {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
    margin-top: 1rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .user-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
