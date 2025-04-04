<template>
    <div class="login-container">
      <div class="login-box">
        <h2 class="text-2xl font-bold mb-4">Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-gray-700">Username</label>
            <input v-model="username" type="text" class="input" required />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Password</label>
            <input v-model="password" type="password" class="input" required />
          </div>
          <button type="submit" class="btn">Submit</button>
        </form>
        <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'LoginView',
    data() {
      return {
        username: '',
        password: '',
        errorMessage: ''
      };
    },
    methods: {
      async handleLogin() {
        try {
          const res = await axios.post('http://localhost:3000/api/auth/login', {
            username: this.username,
            password: this.password
          });
  
          if (res.data && res.data.token) {
            // Save token and role locally
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role || 'user');
  
            // Redirect based on role
            if (this.username === 'admin') {
              this.$router.push('/inventory');
            } else {
              this.$router.push('/orders');
            }
          } else {
            this.errorMessage = 'Invalid login credentials';
          }
        } catch (err) {
          console.error(err);
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
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
  </style>
  