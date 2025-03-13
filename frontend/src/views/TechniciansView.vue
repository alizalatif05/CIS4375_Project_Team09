<template>
    <div>
      <h1>Technicians</h1>
      <input type="text" v-model="searchQuery" placeholder="Search technicians..." />
      <ul>
        <li v-for="tech in filteredTechnicians" :key="tech.id">
          {{ tech.name }} - {{ tech.specialty }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "TechniciansView",
    data() {
      return {
        technicians: [],
        searchQuery: "",
      };
    },
    computed: {
      filteredTechnicians() {
        return this.technicians.filter((tech) =>
          tech.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
    },
    mounted() {
      axios.get("/api/technicians").then((response) => {
        this.technicians = response.data;
      });
    },
  };
  </script>
  
  <style scoped>
  input {
    margin-bottom: 10px;
    padding: 5px;
  }
  </style>
  