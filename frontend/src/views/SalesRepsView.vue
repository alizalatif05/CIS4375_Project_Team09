<template>
    <div>
      <h1>Sales Representatives</h1>
      <input v-model="searchQuery" placeholder="Search sales reps..." />
      <ul>
        <li v-for="salesRep in filteredSalesReps" :key="salesRep.SalesRepID">
          {{ salesRep.SalesRep_fname }} {{ salesRep.SalesRep_lname }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        salesReps: [],
        searchQuery: '',
      };
    },
    computed: {
      filteredSalesReps() {
        return this.salesReps.filter(rep =>
          `${rep.SalesRep_fname} ${rep.SalesRep_lname}`
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
        );
      },
    },
    async created() {
      try {
        const response = await axios.get('http://localhost:5000/api/sales-reps');
        this.salesReps = response.data;
      } catch (error) {
        console.error("Error fetching sales reps:", error);
      }
    },
  };
  </script>
  