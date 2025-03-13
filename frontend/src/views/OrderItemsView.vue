<!-- <template>
  <div>
    <h1>Orders</h1>
    <input v-model="searchQuery" placeholder="Search orders by ID..." />
    <ul>
      <li v-for="order in filteredOrders" :key="order.OrderID">
        Order ID: {{ order.OrderID }} - Customer: {{ order.CustomerID }} - Technician: {{ order.TechID }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      orders: [],
      searchQuery: '',
    };
  },
  computed: {
    filteredOrders() {
      return this.orders.filter(order =>
        order.OrderID.toString().includes(this.searchQuery)
      );
    },
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      this.orders = response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  },
};
</script> -->

<template>
    <div>
      <h1>Orders</h1>
      <input v-model.trim="searchQuery" placeholder="Search orders by ID..." />
  
      <ul v-if="filteredOrders.length">
        <li v-for="order in filteredOrders" :key="order.OrderID">
          Order ID: {{ order.OrderID }} - Customer: {{ order.CustomerID }} - Technician:
          {{ order.TechID }}
        </li>
      </ul>
  
      <p v-else>No matching orders found.</p>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    data() {
      return {
        orders: [],
        searchQuery: '',
        error: null,
      }
    },
    computed: {
      filteredOrders() {
        return this.orders.filter((order) => order.OrderID.toString().includes(this.searchQuery))
      },
    },
    methods: {
      async fetchOrders() {
        try {
          const { data } = await axios.get('http://localhost:5000/api/orders')
          this.orders = data
        } catch (err) {
          this.error = 'Error fetching orders.'
          console.error(err)
        }
      },
    },
    created() {
      this.fetchOrders()
    },
  }
  </script>