<template>
  <div class="welcome-container">
    <h1>Welcome to Militia Protection</h1>
    <p>Your trusted security professionals.</p>

    <div class="info-section">
      <div class="info-card">
        <h2>Our Mission</h2>
        <p>
          At Militia Protection, we provide top-tier security solutions and inventory tracking for our clients. 
          Our system ensures seamless security of equipment, personnel, and resources.
        </p>
      </div>

      <div class="info-card">
        <h2>Key Features</h2>
        <ul>
          <li>🔒 Secure access control for administrators and users.</li>
          <li>🚀 Fast & efficient technician deployment.</li>
        </ul>
      </div>

      <div class="info-card">
        <h2>Need Support?</h2>
        <p>
          If you have any questions, reach out to our support team at 
          <a href="mailto:support@militiaprotection.com">support@militiaprotection.com</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #003366;
  font-size: 32px;
}

p {
  font-size: 18px;
}

.info-section {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 20px;
}

.info-card {
  background: #f5f5f5;
  padding: 15px;
  width: 30%;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
  color: #00509e;
}

ul {
  text-align: left;
  padding-left: 20px;
}
</style>
