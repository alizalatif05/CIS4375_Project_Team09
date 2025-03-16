<template>

  <!--Normal Inventory-->
    <div>
      <h1>Inventory</h1>
      <input v-model="searchQuery" placeholder="Search items..." />
      <ul>
        <li v-for="item in filteredInventory" :key="item.SKU_Number">
          {{ item.ItemName }} ({{ item.Item_Quantity }})
        </li>
      </ul>
    </div>

<!--Technician Inventory-->
    <div>
      <h1>Tech Inventory</h1>
      <input v-model="searchQuery" placeholder="Search by SKU or Technician ID..." />
      <ul>
        <li v-for="item in filteredInventory" :key="`${item.SKU_Number}-${item.TechID}`">
          SKU: {{ item.SKU_Number }} - Technician ID: {{ item.TechID }}
        </li>
      </ul>
    </div>

  </template>

<script>

// INV Script
    import axios from 'axios';
    
    export default {
      data() {
        return {
          inventory: [],
          searchQuery: '',
        };
      },
      computed: {
        filteredInventory() {
          return this.inventory.filter(item => 
            item.ItemName.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        },
      },
      async created() {
        try {
          const response = await axios.get('http://localhost:3000/api/inventory');
          this.inventory = response.data;
        } catch (error) {
          // Display Error Message here
          console.error("Error fetching inventory:", error);
        }
      },
    };
    </script>