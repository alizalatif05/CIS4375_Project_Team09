import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import InventoryView from '@/views/InventoryView.vue';
import CustomersView from '@/views/CustomersView.vue';
import TechniciansView from '@/views/TechniciansView.vue';
import OrdersView from '@/views/OrderItemsView.vue';
import UsersView from '@/views/UsersView.vue';
import AdminView from '@/views/AdminView.vue';
import OrderItemsView from '@/views/OrderItemsView.vue';
import SalesRepsView from '@/views/SalesRepsView.vue';
import TechInventoryView from '@/views/TechInventoryView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/inventory', name: 'inventory', component: InventoryView },
  { path: '/customers', name: 'customers', component: CustomersView },
  { path: '/technicians', name: 'technicians', component: TechniciansView },
  { path: '/orders', name: 'orders', component: OrdersView },
  { path: '/users', name: 'users', component: UsersView },
  { path: '/admins', name: 'admins', component: AdminView },
  { path: '/order-items', name: 'order-items', component: OrderItemsView },
  { path: '/sales-reps', name: 'sales-reps', component: SalesRepsView },
  { path: '/tech-inventory', name: 'tech-inventory', component: TechInventoryView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
