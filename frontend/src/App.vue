<template>
  <header>
    <img src="@/assets/Militia Protection Logo.png" />
  </header>

  <nav v-if="isAuthenticated">
    <router-link to="/home">Home</router-link> |
    <router-link to="/inventory">Inventory</router-link> |
    <router-link to="/customers">Customers</router-link> |
    <router-link to="/orders">Orders</router-link> |
    <router-link to="/admins">Admins</router-link> |
    <a href="#" @click.prevent="logout">Logout</a>
  </nav>

  <main>
    <router-view />
  </main>
</template>

<script>
export default {
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
header {
  background-color: #003366;
  color: white;
  padding: 15px;
  text-align: center;
}

nav {
  background-color: #00509e;
  padding: 10px;
  text-align: center;
}

nav a {
  color: white;
  margin: 0 10px;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

main {
  padding: 20px;
}
</style>
