<template>
    <div>
      <h1>Order Items</h1>
      <input v-model="searchQuery" placeholder="Search order items..." />
      <ul>
        <li v-for="orderItem in filteredOrderItems" :key="`${orderItem.SKU_Number}-${orderItem.OrderID}`">
          SKU: {{ orderItem.SKU_Number }} - Order ID: {{ orderItem.OrderID }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        orderItems: [],
        searchQuery: '',
      };
    },
    computed: {
      filteredOrderItems() {
        return this.orderItems.filter(orderItem =>
          orderItem.SKU_Number.toString().includes(this.searchQuery) ||
          orderItem.OrderID.toString().includes(this.searchQuery)
        );
      },
    },
    async created() {
      try {
        const response = await axios.get('http://localhost:5000/api/order-items');
        this.orderItems = response.data;
      } catch (error) {
        console.error("Error fetching order items:", error);
      }
    },
  };
  </script>
  