<template>
    <div>
      <h1>Users</h1>
      <input v-model="searchQuery" placeholder="Search users..." />
      <ul>
        <li v-for="user in filteredUsers" :key="user.UserID">
          {{ user.user_fname }} {{ user.user_lname }} - {{ user.username }} ({{ user.User_Type }})
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        users: [],
        searchQuery: '',
      };
    },
    computed: {
      filteredUsers() {
        return this.users.filter(user =>
          `${user.user_fname} ${user.user_lname}`
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
        );
      },
    },
    async created() {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        this.users = response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
  };
  </script>
  