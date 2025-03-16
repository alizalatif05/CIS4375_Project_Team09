import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import InventoryView from '@/views/InventoryView.vue';
import CustomersView from '@/views/CustomersView.vue';
import OrdersView from '@/views/OrderItemsView.vue';
import AdminView from '@/views/AdminOperarations.vue';



const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/inventory', name: 'inventory', component: InventoryView },
  { path: '/customers', name: 'customers', component: CustomersView },
  { path: '/orders', name: 'orders', component: OrdersView },
  { path: '/admins', name: 'admins', component: AdminView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
