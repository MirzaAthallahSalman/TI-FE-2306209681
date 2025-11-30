<template>
  <nav class="navbar">
    <div class="nav-brand">✈️ Flight Management</div>
    <div class="nav-links">
      <!-- Home - Not for customers -->
      <router-link v-if="authStore.canAccessHome" to="/">Home</router-link>

      <!-- Airplanes - Not for customers -->
      <router-link v-if="authStore.canAccessAirplanes" to="/airplanes">Airplanes</router-link>

      <!-- Flights - For all authenticated users -->
      <router-link to="/flights">Flights</router-link>

      <!-- Bookings - For all authenticated users -->
      <router-link to="/bookings">Bookings</router-link>

      <!-- Statistics - Only for SuperAdmin and Flight Airline -->
      <router-link v-if="authStore.canAccessStatistics" to="/statistics">📊 Statistics</router-link>

      <!-- Support Tickets - For all authenticated users -->
      <router-link to="/tickets">🎫 Support</router-link>

      <!-- User Info & Logout -->
      <div class="user-section" v-if="authStore.isAuthenticated">
        <span class="user-role">{{ authStore.user?.role }}</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

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
  gap: 15px;
  align-items: center;
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

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.user-role {
  color: white;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #ef4444;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .user-section {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
  }
}
</style>
