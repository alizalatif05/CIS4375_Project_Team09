<template>

  <!--Login-->
  <div class="login-container">
    <div class="login-box">
      <h2 class="text-2xl font-bold mb-4">
        {{ isAdminMode ? 'Admin Login' : 'User Login' }}
      </h2>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block text-gray-700">Username</label>
          <input 
            v-model="username" 
            type="text" 
            class="input" 
            required 
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="input" 
            required 
          />
        </div>
        
        <button 
          type="submit" 
          class="btn" 
          :disabled="isLoading"
        >
          {{ isLoading 
            ? 'Logging in...'
            : (isAdminMode ? 'Admin Login' : 'Login') 
          }}
        </button>
      </form>
      
      <div class="mt-4 text-center">
        <p class="text-sm">
          {{ isAdminMode ? 'Regular user?' : 'Admin access?' }}
          <a 
            href="#" 
            class="text-blue-500 hover:underline"
            @click.prevent="toggleAdminMode"
          >
            {{ isAdminMode ? 'User Login' : 'Admin Login' }}
          </a>
        </p>
      </div>
      
      <p v-if="errorMessage" class="text-red-500 mt-2">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      isLoading: false,
      isAdminMode: false
    };
  },
  methods: {
    async handleUserLogin() {
      try {
        const res = await axios.post('http://localhost:3000/api/auth/login', {
          username: this.username,
          password: this.password
        });

        if (res.data && res.data.token) {
          // Save token and role
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('isAdmin', res.data.isAdmin || false);
          
          // Trigger a custom event to update authentication state
          window.dispatchEvent(new Event('auth-changed'));
          
          // Redirect to home page
          this.$router.push('/home');
        }
      } catch (err) {
        // Handle different types of errors
        if (err.response) {
          this.errorMessage = err.response.data.message || 'Login failed';
        } else if (err.request) {
          this.errorMessage = 'No response from server. Please check your connection.';
        } else {
          this.errorMessage = 'Error processing login. Please try again.';
        }
        
        console.error('Login error:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async handleAdminLogin() {
      try {
        const res = await axios.post('http://localhost:3000/api/auth/admin-login', {
          username: this.username,
          password: this.password
        });

        if (res.data && res.data.token) {
          // Verify this is an admin account
          if (res.data.isAdmin) {
            // Save token and admin status
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('isAdmin', true);
            
            // update authentication state
            window.dispatchEvent(new Event('auth-changed'));
            
            // Redirect to admin dashboard
            this.$router.push('/admin/admins');
          } else {
            this.errorMessage = 'Admin access required';
          }
        }
      } catch (err) {
        if (err.response) {
          this.errorMessage = err.response.data.message || 'Admin login failed';
        } else if (err.request) {
          this.errorMessage = 'No response from server. Please check your connection.';
        } else {
          this.errorMessage = 'Error processing admin login. Please try again.';
        }
        
        console.error('Admin login error:', err);
      } finally {
        this.isLoading = false;
      }
    },

    toggleAdminMode() {
      this.isAdminMode = !this.isAdminMode;
      this.errorMessage = ''; // Clear any previous error messages
      // Reset form
      this.username = '';
      this.password = '';
    },

    submitForm() {
      // Reset previous error message
      this.errorMessage = '';
      
      // Validate input
      if (!this.username || !this.password) {
        this.errorMessage = 'Please enter username and password';
        return;
      }

      // Set loading state
      this.isLoading = true;

      if (this.isAdminMode) {
        this.handleAdminLogin();
      } else {
        this.handleUserLogin();
      }
    }
  },
  mounted() {
    // Clear any existing tokens 
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    
    // Listen for authentication changes
    window.addEventListener('auth-changed', () => {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        this.$router.push('/admin/admins');
      } else {
        this.$router.push('/home');
      }
    });
  }
};
</script>
  
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-box {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}
.btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
}
.btn:disabled {
  background-color: #a5a4e2;
  cursor: not-allowed;
}
</style>