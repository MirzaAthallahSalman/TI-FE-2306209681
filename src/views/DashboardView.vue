<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="home-container">
    <div class="container">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="nav-brand">
          ✈️ Flight Management
        </div>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/airplanes">Airplanes</router-link>
          <router-link to="/flights">Flights</router-link>
          <router-link to="/bookings">Flight Bookings</router-link>
        </div>
      </nav>

      <!-- Header -->
      <div class="header">
        <div class="header-icon">✈️</div>
        <h1 class="header-title">Flight Management System</h1>
        <p class="header-subtitle">Your real-time flight operations and booking management dashboard</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error">
        ❌ Error loading dashboard data: {{ error }}. Make sure backend is running!
      </div>

      <!-- Stats Section -->
      <div v-if="!loading" class="stats-section">
        <div class="stats-grid">
          <!-- Penerbangan Aktif -->
          <div class="stat-card">
            <div class="stat-icon blue">✈️</div>
            <div class="stat-content">
              <div class="stat-label">Flight</div>
              <div class="stat-value">{{ stats.activeFlights }}</div>
              <div class="stat-subtext">Penerbangan Aktif</div>
            </div>
          </div>

          <!-- Booking Hari Ini -->
          <div class="stat-card">
            <div class="stat-icon green">📋</div>
            <div class="stat-content">
              <div class="stat-label">Booking</div>
              <div class="stat-value">{{ stats.todayBookings }}</div>
              <div class="stat-subtext">Booking Dibuat Hari Ini</div>
            </div>
          </div>

          <!-- Maskapai Terdaftar -->
          <div class="stat-card">
            <div class="stat-icon orange">🏢</div>
            <div class="stat-content">
              <div class="stat-label">Total</div>
              <div class="stat-value">{{ stats.registeredAirlines }}</div>
              <div class="stat-subtext">Maskapai (Airline) Terdaftar</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions-section">
        <div style="text-align: center;">
          <span class="section-header">⚡ Quick Actions</span>
        </div>

        <div class="actions-grid">
          <!-- Manage Airplanes -->
          <router-link to="/airplanes" class="action-card">
            <div class="action-icon">✈️</div>
            <div class="action-content">
              <div class="action-title">Manage Airplanes</div>
              <div class="action-desc">Add and manage aircraft fleet</div>
            </div>
          </router-link>

          <!-- Flight Archive -->
          <router-link to="/flights" class="action-card">
            <div class="action-icon">📚</div>
            <div class="action-content">
              <div class="action-title">Flight Archive</div>
              <div class="action-desc">View historical flight data</div>
            </div>
          </router-link>

          <!-- Manage Flights -->
          <router-link to="/flights" class="action-card">
            <div class="action-icon">🛫</div>
            <div class="action-content">
              <div class="action-title">Manage Flights</div>
              <div class="action-desc">Schedule and update flights</div>
            </div>
          </router-link>

          <!-- View Bookings -->
          <router-link to="/bookings" class="action-card">
            <div class="action-icon">👥</div>
            <div class="action-content">
              <div class="action-title">View Bookings</div>
              <div class="action-desc">Manage customer reservations</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type { DashboardStats } from '@/interfaces/dashboard.interface'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

// State
const loading = ref(true)
const error = ref('')
const stats = ref<DashboardStats>({
  activeFlights: 0,
  todayBookings: 0,
  registeredAirlines: 0
})

// Methods
const loadDashboardStats = async () => {
  try {
    const response = await axios.get<DashboardStats>(`${API_BASE_URL}/dashboard/stats`)
    stats.value = response.data
  } catch (err: any) {
    console.error('Error loading dashboard stats:', err)
    error.value = err.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardStats()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Navbar */
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

.nav-links a:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Header Section */
.header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.header-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.header-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 25px;
}

/* Loading & Error States */
.loading {
  text-align: center;
  padding: 40px;
  color: white;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
}

/* Stats Section */
.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-subtext {
  color: #888;
  font-size: 0.8rem;
  margin-top: 3px;
}

/* Quick Actions Section */
.quick-actions-section {
  margin-bottom: 30px;
}

.section-header {
  background: white;
  color: #667eea;
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.action-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.action-desc {
  font-size: 0.8rem;
  color: #888;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
