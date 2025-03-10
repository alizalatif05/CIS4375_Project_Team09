<template>
    <div>
      <h1>Customers</h1>
      <input v-model="searchQuery" placeholder="Search customers..." />
      <ul>
        <li v-for="customer in filteredCustomers" :key="customer.CustomerID">
          {{ customer.customer_fname }} {{ customer.customer_lname }} - {{ customer.customerphone }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        customers: [],
        searchQuery: '',
      };
    },
    computed: {
      filteredCustomers() {
        return this.customers.filter(customer =>
          `${customer.customer_fname} ${customer.customer_lname}`
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
        );
      },
    },
    async created() {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        this.customers = response.data;
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    },
  };
  </script>
  