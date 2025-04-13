<template>
  <div class="page-container">
    <h1 class="page-title">Militia Protection Internal Dashboard</h1>

    <p class="page-description">
      This system helps our internal team manage inventory, orders, and customer records efficiently.
    </p>

    <div class="role-info">
      <p><strong>Regular Users:</strong> Access the <em>Inventory</em>, <em>Orders</em>, and <em>Customers</em> sections to manage day-to-day operations.</p>
      <p><strong>Admins:</strong> In addition to the above, access the <em>Admin</em> panel to manage user roles and permissions.</p>
    </div>

    <div class="card-grid">
      <router-link to="/inventory" class="nav-card">
        <img src="/icons/inventory-icon.png" alt="Inventory" />
        <span>Inventory</span>
      </router-link>

      <router-link to="/orders" class="nav-card">
        <img src="/icons/orders-icon.png" alt="Orders" />
        <span>Orders</span>
      </router-link>

      <router-link to="/customers" class="nav-card">
        <img src="/icons/customers-icon.png" alt="Customers" />
        <span>Customers</span>
      </router-link>

      <router-link to="/admin/admins" class="nav-card">
        <img src="/icons/admin-icon.png" alt="Admins" />
        <span>Admins</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  background-color: #f4f8fc;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.page-title {
  font-size: 2.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.page-description {
  font-size: 1.15rem;
  margin-bottom: 1.5rem;
  color: #34495e;
}

.role-info p {
  margin: 0.5rem 0;
  color: #333;
  font-size: 1.05rem;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2.5rem;
  margin-top: 2.5rem;
}

.nav-card {
  width: 260px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #2c3e50;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.nav-card img {
  width: 70px;
  height: 70px;
  margin-bottom: 1.2rem;
}

.nav-card span {
  font-size: 1.2rem;
  font-weight: 700;
}
</style>

