<template>
  <header>
    <h1>{{ companyName }}</h1>
  </header>

  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/inventory">Inventory</router-link> |
    <router-link to="/customers">Customers</router-link> |
    <router-link to="/technicians">Technicians</router-link> |
    <router-link to="/orders">Orders</router-link> |
    <router-link to="/users">Users</router-link> |
    <router-link to="/admins">Admins</router-link> |
    <router-link to="/order-items">Order Items</router-link> |
    <router-link to="/sales-reps">Sales Representatives</router-link> |
    <router-link to="/tech-inventory">Tech Inventory</router-link>
  </nav>

  <main>
    <router-view />
  </main>
</template>

<script>
export default {
  data() {
    return {
      companyName: "Militia Protection" 
    };
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
