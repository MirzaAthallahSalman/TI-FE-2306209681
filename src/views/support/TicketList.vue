<template>
  <div class="support-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">🎫 Support Center</div>
      <div class="nav-links">
        <router-link v-if="authStore.canAccessHome" to="/">Home</router-link>
        <router-link v-if="authStore.canAccessAirplanes" to="/airplanes">Airplanes</router-link>
        <router-link to="/flights">Flights</router-link>
        <router-link to="/bookings">Bookings</router-link>
        <router-link v-if="authStore.canAccessStatistics" to="/statistics">📊 Statistics</router-link>
        <router-link to="/tickets" class="active">Support Tickets</router-link>
        <div class="user-section" v-if="authStore.isAuthenticated">
          <span class="user-role">{{ authStore.user?.role }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-icon">🎫</div>
          <div class="header-title">Support Tickets</div>
        </div>
        <button @click="goToCreateTicket" class="btn-create">➕ Buat Ticket Baru</button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">📋</div>
          <div class="stat-content">
            <div class="stat-label">Total Tickets</div>
            <div class="stat-value">{{ tickets.length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon open">🔵</div>
          <div class="stat-content">
            <div class="stat-label">Open</div>
            <div class="stat-value">{{ openTickets.length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon progress">🟡</div>
          <div class="stat-content">
            <div class="stat-label">In Progress</div>
            <div class="stat-value">{{ inProgressTickets.length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon closed">🟢</div>
          <div class="stat-content">
            <div class="stat-label">Closed</div>
            <div class="stat-value">{{ closedTickets.length }}</div>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-grid">
          <div class="filter-group">
            <label>📊 Status</label>
            <select v-model="filterStatus">
              <option value="">Semua Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div class="filter-group search-group">
            <label>🔍 Cari</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari ticket berdasarkan subject, booking ID, atau email..."
            />
          </div>
        </div>

        <div class="filter-actions">
          <button
            class="btn-reset"
            @click="filterStatus = ''; searchQuery = ''"
          >
            🔄 Reset Filter
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Memuat tickets...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="fetchAllTickets">🔄 Coba Lagi</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTickets.length === 0" class="empty-state">
        <div class="empty-icon">🎫</div>
        <h3 class="empty-title">Tidak ada ticket</h3>
        <p class="empty-text">
          {{
            searchQuery || filterStatus
              ? 'Tidak ada ticket yang sesuai filter'
              : 'Belum ada ticket yang dibuat'
          }}
        </p>
        <button class="btn btn-primary" @click="goToCreateTicket">➕ Buat Ticket Baru</button>
      </div>

      <!-- Ticket List -->
      <div v-else class="tickets-container">
        <div
          v-for="ticket in filteredTickets"
          :key="ticket.ticketId"
          class="ticket-card"
          @click="goToTicketDetail(ticket.ticketId)"
        >
          <div class="ticket-header">
            <div class="ticket-badges">
              <span :class="['status-badge', getStatusBadgeClass(ticket.status)]">
                {{ ticket.status }}
              </span>
              <span class="service-badge"> ✈️ {{ ticket.externalServiceSource }} </span>
            </div>
            <div class="ticket-arrow">→</div>
          </div>

          <h3 class="ticket-subject">{{ ticket.subject }}</h3>

          <div class="ticket-meta">
            <span class="meta-item"> 📅 {{ formatDate(ticket.createdAt) }} </span>
            <span v-if="ticket.bookingInfo" class="meta-item">
              👤 {{ ticket.bookingInfo.contactEmail }}
            </span>
            <span class="meta-item booking-id">
              🔖 {{ ticket.externalBookingId?.substring(0, 8) }}...
            </span>
          </div>

          <div v-if="ticket.bookingInfo" class="ticket-booking-info">
            <span>{{ ticket.bookingInfo.displayTitle }}</span>
            <span class="separator">-</span>
            <span>{{ ticket.bookingInfo.displaySubtitle }}</span>
          </div>

          <div class="ticket-footer">
            <div class="message-count">
              <span class="count-value">{{ ticket.messageCount || 0 }}</span>
              <span class="count-label">Pesan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupportTicket } from '@/composables/useSupportTicket'
import { useAuthStore } from '@/stores/auth/authStore'
import type { TicketStatus } from '@/interfaces/support'

const router = useRouter()
const authStore = useAuthStore()

// Logout handler
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const {
  tickets,
  openTickets,
  inProgressTickets,
  closedTickets,
  isLoading,
  error,
  fetchAllTickets,
  goToTicketDetail,
  goToCreateTicket,
  formatDate,
  getStatusColor,
} = useSupportTicket()

// Local state for filters
const filterStatus = ref<TicketStatus | ''>('')
const searchQuery = ref('')

// Computed filtered tickets
const filteredTickets = computed(() => {
  let result = [...tickets.value]

  // Filter by status
  if (filterStatus.value) {
    result = result.filter((t) => t.status === filterStatus.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (t) =>
        t.subject.toLowerCase().includes(query) ||
        t.externalBookingId?.toLowerCase().includes(query) ||
        t.bookingInfo?.contactEmail?.toLowerCase().includes(query),
    )
  }

  // Sort by date (newest first)
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return result
})

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Open':
      return 'status-open'
    case 'In Progress':
      return 'status-progress'
    case 'Closed':
      return 'status-closed'
    default:
      return ''
  }
}

// Fetch tickets on mount
onMounted(() => {
  fetchAllTickets()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.support-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.nav-brand {
  color: white;
  font-size: 1.1rem;
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
.nav-links a.active {
  background: rgba(255, 255, 255, 0.2);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 15px;
  padding-left: 15px;
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

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon {
  font-size: 2.5rem;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
}

.btn-create {
  background: white;
  color: #667eea;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.open {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-icon.progress {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.closed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.filter-group input,
.filter-group select {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.search-group {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.btn-reset {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-reset:hover {
  background: #f5f5f5;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  background: white;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-message {
  color: #ff6b6b;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.empty-text {
  color: #666;
  margin-bottom: 25px;
}

/* Tickets Container */
.tickets-container {
  display: grid;
  gap: 20px;
}

.ticket-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.ticket-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ticket-badges {
  display: flex;
  gap: 10px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-open {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.15) 100%);
  color: #1d4ed8;
}

.status-progress {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%);
  color: #d97706;
}

.status-closed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  color: #059669;
}

.service-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f5f5f5;
  color: #555;
}

.ticket-arrow {
  font-size: 1.5rem;
  color: #ccc;
  transition:
    color 0.3s,
    transform 0.3s;
}

.ticket-card:hover .ticket-arrow {
  color: #667eea;
  transform: translateX(5px);
}

.ticket-subject {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.ticket-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 0.85rem;
  color: #666;
}

.booking-id {
  font-family: monospace;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.ticket-booking-info {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  color: #ccc;
}

.ticket-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.message-count {
  text-align: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 10px 20px;
  border-radius: 10px;
}

.count-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.count-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
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

  .header-section {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .ticket-meta {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
