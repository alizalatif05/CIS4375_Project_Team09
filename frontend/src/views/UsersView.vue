<!-- <template>
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
    -->
 
    <template>
        <div>
          <h1>Users</h1>
          <input v-model="searchQuery" placeholder="Search users..." />
      
          <ul v-if="filteredUsers.length">
            <li
              v-for="{ UserID, user_fname, user_lname, username, User_Type } in filteredUsers"
              :key="UserID"
            >
              {{ user_fname }} {{ user_lname }} - {{ username }} ({{ User_Type }})
            </li>
          </ul>
          <p v-else>No matching users found.</p>
      
          <p v-if="error">{{ error }}</p>
          <button @click="fetchUsers">Refresh</button>
        </div>
      </template>
      
      <script>
      import axios from 'axios'
      
      export default {
        data: () => ({
          users: [],
          searchQuery: '',
          error: null,
        }),
        computed: {
          filteredUsers() {
            const query = this.searchQuery.toLowerCase()
            return this.users.filter(({ user_fname, user_lname }) =>
              `${user_fname} ${user_lname}`.toLowerCase().includes(query),
            )
          },
        },
        methods: {
          async fetchUsers() {
            try {
              const { data } = await axios.get('http://localhost:5000/api/users')
              this.users = data
              this.error = null
            } catch (err) {
              this.error = 'Error fetching users.'
              console.error(err)
            }
          },
        },
        created() {
          this.fetchUsers()
        },
      }
      </script>