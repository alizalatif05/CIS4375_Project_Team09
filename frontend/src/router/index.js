import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import InventoryView from '@/views/InventoryView.vue';
import CustomersView from '@/views/CustomersView.vue';
import OrdersView from '@/views/OrderItemsView.vue';
import AdminView from '@/views/AdminOperarations.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  { path: '/', redirect: '/login' }, 
  { path: '/home', name: 'home', component: HomeView, meta: {requiresAuth: true } },
  { path: '/inventory', name: 'inventory', component: InventoryView, meta: {requiresAuth: true} },
  { path: '/customers', name: 'customers', component: CustomersView, meta: {requiresAuth: true}  },
  { path: '/orders', name: 'orders', component: OrdersView, meta: {requiresAuth: true}  },
  { path: '/admin/admins', name: 'admins', component: AdminView, meta: {
    requiresAuth: true, requiresAdmin: true
  }
},
  { path: '/login', name: 'login', component: LoginView }
];


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard to wait for auth
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const isAuthenticated = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  console.log(`Navigating to ${to.path}. Token exists: ${!!isAuthenticated}`);

  if (authRequired && !isAuthenticated) {
    return next('/login');

  }
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAdmin) {
      return next('/home');
    }
  }
  next();
});

export default router;
