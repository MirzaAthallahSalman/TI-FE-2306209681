<template>
  <nav class="navbar">
    <div class="nav-brand">✈️ Flight Management</div>
    <div class="nav-links">
      <router-link to="/">Home</router-link>
      <router-link to="/airplanes">Airplanes</router-link>
      <router-link to="/flights">Flights</router-link>
      <router-link to="/bookings">Flight Bookings</router-link>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
}

.nav-brand {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.3s;
  font-size: 0.9rem;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
