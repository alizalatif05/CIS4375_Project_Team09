<template>
    <div>
      <h1>Tech Inventory</h1>
      <input v-model="searchQuery" placeholder="Search by SKU or Technician ID..." />
      <ul>
        <li v-for="item in filteredTechInventory" :key="`${item.SKU_Number}-${item.TechID}`">
          SKU: {{ item.SKU_Number }} - Technician ID: {{ item.TechID }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        techInventory: [],
        searchQuery: '',
      };
    },
    computed: {
      filteredTechInventory() {
        return this.techInventory.filter(item =>
          item.SKU_Number.toString().includes(this.searchQuery) ||
          item.TechID.toString().includes(this.searchQuery)
        );
      },
    },
    async created() {
      try {
        const response = await axios.get('http://localhost:5000/api/tech-inventory');
        this.techInventory = response.data;
      } catch (error) {
        console.error("Error fetching tech inventory:", error);
      }
    },
  };
  </script>
  