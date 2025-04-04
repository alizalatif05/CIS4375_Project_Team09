import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import InventoryView from '@/views/InventoryView.vue';
import CustomersView from '@/views/CustomersView.vue';
import OrdersView from '@/views/OrderItemsView.vue';
import AdminView from '@/views/AdminOperarations.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  { path: '/', redirect: '/login' }, // Redirect base URL to login
  { path: '/home', name: 'home', component: HomeView },
  { path: '/inventory', name: 'inventory', component: InventoryView },
  { path: '/customers', name: 'customers', component: CustomersView },
  { path: '/orders', name: 'orders', component: OrdersView },
  { path: '/admins', name: 'admins', component: AdminView },
  { path: '/login', name: 'login', component: LoginView }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard, guard other pages until logged in 
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');

  console.log(`Navigating to ${to.path}. Token exists: ${!!token}`);

  if (authRequired && !token) {
    return next('/login');

  }

  next();
});

export default router;
