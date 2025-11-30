<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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
      <!-- Back Button -->
      <button @click="goToTicketList" class="btn-back">← Kembali ke Daftar Ticket</button>

      <!-- Loading -->
      <div v-if="isLoading && !currentTicket" class="loading">
        <div class="spinner"></div>
        <p>Memuat detail ticket...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error && !currentTicket" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="loadTicket">🔄 Coba Lagi</button>
      </div>

      <!-- Ticket Content -->
      <div v-else-if="currentTicket" class="ticket-detail-grid">
        <!-- Main Content (Left) -->
        <div class="main-content">
          <!-- Ticket Header Card -->
          <div class="detail-card ticket-header-card">
            <div class="ticket-badges">
              <span :class="['status-badge', getStatusBadgeClass(currentTicket.status)]">
                {{ currentTicket.status }}
              </span>
              <span class="service-badge"> ✈️ {{ currentTicket.externalServiceSource }} </span>
            </div>

            <h1 class="ticket-title">{{ currentTicket.subject }}</h1>

            <div class="ticket-meta-info">
              <span class="meta-item">📅 {{ formatDate(currentTicket.createdAt) }}</span>
              <span v-if="currentTicket.bookingInfo && authStore.canViewTicketDetails" class="meta-item">
                👤 {{ currentTicket.bookingInfo.contactEmail }}
              </span>
              <span class="meta-item booking-id-tag">
                🔖 {{ currentTicket.externalBookingId }}
              </span>
            </div>

            <!-- Booking Info Summary -->
            <div v-if="currentTicket.bookingInfo" class="booking-summary-card">
              <div class="booking-summary-icon">✈️</div>
              <div class="booking-summary-content">
                <p class="booking-summary-title">{{ currentTicket.bookingInfo.displayTitle }}</p>
                <p class="booking-summary-subtitle">
                  {{ currentTicket.bookingInfo.displaySubtitle }}
                </p>
              </div>
            </div>
          </div>

          <!-- Messages / Conversation Card -->
          <div class="detail-card">
            <div class="card-header">
              <h2 class="card-title">💬 Percakapan</h2>
              <span class="message-count-badge">{{ sortedMessages.length }} Pesan</span>
            </div>

            <!-- Message List -->
            <div class="messages-container">
              <div
                v-for="message in sortedMessages"
                :key="message.messageId"
                :class="['message-bubble', isAdminMessage(message.senderName) ? 'admin' : 'user']"
              >
                <div class="message-header">
                  <span
                    :class="['sender-badge', isAdminMessage(message.senderName) ? 'admin' : 'user']"
                  >
                    {{ isAdminMessage(message.senderName) ? '🛡️ ADMIN' : '👤 USER' }}
                  </span>
                  <span class="sender-name">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatRelativeTime(message.createdAt) }}</span>
                </div>
                <p class="message-body">{{ message.messageBody }}</p>
              </div>
            </div>

            <!-- Reply Form -->
            <div v-if="currentTicket.status !== 'Closed'" class="reply-section">
              <h3 class="reply-title">📝 Tambah Balasan</h3>
              <div class="reply-form">
                <input
                  v-model="replyName"
                  type="text"
                  placeholder="Nama Anda"
                  class="reply-input"
                />
                <textarea
                  v-model="replyMessage"
                  rows="3"
                  placeholder="Tulis balasan..."
                  class="reply-textarea"
                />
                <button
                  @click="sendReply"
                  :disabled="isLoading || !replyMessage.trim() || !replyName.trim()"
                  class="btn btn-primary"
                >
                  {{ isLoading ? '⏳ Mengirim...' : '📤 Kirim Balasan' }}
                </button>
              </div>
            </div>

            <!-- Closed Notice -->
            <div v-else class="closed-notice">
              🔒 Ticket ini sudah ditutup dan tidak dapat dibalas
            </div>
          </div>
        </div>

        <!-- Sidebar (Right) -->
        <div class="sidebar">
          <!-- Status Update Card - Only for non-customers -->
          <div v-if="authStore.canViewTicketDetails" class="sidebar-card">
            <h2 class="sidebar-title">📊 Status Ticket</h2>
            <div class="status-form">
              <select v-model="newStatus" class="status-select">
                <option value="">-- Pilih Status --</option>
                <option value="Open">🔵 Open</option>
                <option value="In Progress">🟡 In Progress</option>
                <option value="Closed">🟢 Closed</option>
              </select>
              <button
                @click="updateStatus"
                :disabled="isLoading || !newStatus"
                class="btn btn-success"
              >
                {{ isLoading ? '⏳ Updating...' : '✅ Update Status' }}
              </button>
            </div>
          </div>

          <!-- Add Progress Card - Only for non-customers -->
          <div v-if="authStore.canAddTicketProgress" class="sidebar-card">
            <h2 class="sidebar-title">📋 Tambah Progress</h2>
            <div class="progress-form">
              <textarea
                v-model="progressText"
                rows="2"
                placeholder="Deskripsi progress..."
                class="progress-textarea"
              />
              <select v-model="progressRole" class="role-select">
                <option value="Admin">🛡️ Admin</option>
                <option value="Support">📞 Support</option>
                <option value="System">⚙️ System</option>
              </select>
              <button
                @click="addProgress"
                :disabled="isLoading || !progressText.trim()"
                class="btn btn-purple"
              >
                {{ isLoading ? '⏳ Menambahkan...' : '➕ Tambah Progress' }}
              </button>
            </div>
          </div>

          <!-- Booking Detail Button - Only for non-customers -->
          <div v-if="authStore.canViewTicketDetails" class="sidebar-card">
            <h2 class="sidebar-title">📄 Data Booking</h2>
            <button
              @click="showBookingDetail = true; loadBookingDetail()"
              class="btn btn-booking"
            >
              📋 Lihat Detail Booking
            </button>
          </div>

          <!-- Progress History Card - Only for non-customers -->
          <div v-if="authStore.canViewTicketDetails" class="sidebar-card">
            <h2 class="sidebar-title">📜 Riwayat Progress</h2>
            <div
              v-if="!currentTicket.progressList || currentTicket.progressList.length === 0"
              class="no-progress"
            >
              Belum ada progress
            </div>
            <div v-else class="progress-timeline">
              <div
                v-for="progress in currentTicket.progressList"
                :key="progress.progressId"
                class="progress-item"
              >
                <div class="progress-role-badge">{{ progress.role }}</div>
                <p class="progress-text">{{ progress.text }}</p>
                <p class="progress-time">{{ formatRelativeTime(progress.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Customer view - limited info -->
          <div v-if="!authStore.canViewTicketDetails" class="sidebar-card">
            <h2 class="sidebar-title">ℹ️ Informasi</h2>
            <p class="info-text">Anda dapat melihat status dan membalas pesan pada tiket ini. Untuk informasi lebih lanjut, silakan hubungi admin.</p>
          </div>
        </div>
      </div>

      <!-- Booking Detail Modal -->
      <Teleport to="body">
        <div v-if="showBookingDetail" class="modal-overlay" @click.self="showBookingDetail = false">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title">📋 Detail Booking</h2>
              <button @click="showBookingDetail = false" class="modal-close">✕</button>
            </div>

            <div class="modal-body">
              <!-- Loading -->
              <div v-if="isLoading && !currentBookingDetail" class="modal-loading">
                <div class="spinner"></div>
              </div>

              <!-- Booking Data (Simplified) -->
              <div v-else-if="currentBookingDetail" class="booking-detail-grid">
                <div class="booking-detail-item">
                  <p class="detail-label">BOOKING ID</p>
                  <p class="detail-value">{{ currentBookingDetail.bookingIdString || '-' }}</p>
                </div>
                <div class="booking-detail-item">
                  <p class="detail-label">CONTACT EMAIL</p>
                  <p class="detail-value">{{ currentBookingDetail.contactEmail || '-' }}</p>
                </div>
                <div class="booking-detail-item">
                  <p class="detail-label">CONTACT PHONE</p>
                  <p class="detail-value">{{ currentBookingDetail.contactPhone || '-' }}</p>
                </div>
              </div>

              <!-- Error -->
              <div v-else-if="error" class="modal-error">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupportTicket } from '@/composables/useSupportTicket'
import { useSupportTicketStore } from '@/stores/support/supportTicketStore'
import { useAuthStore } from '@/stores/auth/authStore'
import type { TicketStatus } from '@/interfaces/support'

const route = useRoute()
const router = useRouter()
const ticketId = route.params.id as string

const store = useSupportTicketStore()
const authStore = useAuthStore()
const {
  currentTicket,
  currentBookingDetail,
  isLoading,
  error,
  fetchTicketDetail,
  fetchBookingDetail,
  goToTicketList,
  formatDate,
  formatRelativeTime,
  getStatusColor,
} = useSupportTicket()

// Logout handler
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Sorted messages computed
const sortedMessages = computed(() => {
  if (!currentTicket.value?.messages) return []
  return [...currentTicket.value.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
})

// Local state
const showBookingDetail = ref(false)
const replyMessage = ref('')
const replyName = ref('')
const newStatus = ref<TicketStatus | ''>('')
const progressText = ref('')
const progressRole = ref('Admin')

// Helper functions
const isAdminMessage = (senderName?: string) => {
  return senderName?.toLowerCase().includes('admin')
}

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

// Methods
const loadTicket = async () => {
  await fetchTicketDetail(ticketId)
}

const loadBookingDetail = async () => {
  if (currentTicket.value) {
    await fetchBookingDetail(ticketId)
  }
}

const sendReply = async () => {
  if (!replyMessage.value.trim() || !replyName.value.trim()) return

  try {
    await store.replyToTicket(ticketId, replyMessage.value, replyName.value)
    replyMessage.value = ''
    // Reload ticket to get updated messages
    await loadTicket()
  } catch (err) {
    console.error('Failed to send reply:', err)
  }
}

const updateStatus = async () => {
  if (!newStatus.value) return

  try {
    await store.updateTicketStatus(ticketId, newStatus.value)
    newStatus.value = ''
    // Reload ticket to get updated status
    await loadTicket()
  } catch (err) {
    console.error('Failed to update status:', err)
  }
}

const addProgress = async () => {
  if (!progressText.value.trim()) return

  try {
    await store.addProgress(ticketId, progressText.value, progressRole.value)
    progressText.value = ''
    // Reload ticket to get updated progress list
    await loadTicket()
  } catch (err) {
    console.error('Failed to add progress:', err)
  }
}

const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (typeof value === 'number') return value.toLocaleString('id-ID')
  return String(value)
}

// Load ticket on mount
onMounted(() => {
  loadTicket()
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
  max-width: 1400px;
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

.info-text {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Back Button */
.btn-back {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 25px;
  font-size: 0.95rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
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

/* Ticket Detail Grid */
.ticket-detail-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 25px;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Detail Card */
.detail-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.message-count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Ticket Header Card */
.ticket-header-card {
  position: relative;
}

.ticket-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.status-badge {
  padding: 8px 18px;
  border-radius: 25px;
  font-size: 0.9rem;
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
  padding: 8px 18px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  background: #f5f5f5;
  color: #555;
}

.ticket-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.ticket-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  font-size: 0.9rem;
  color: #666;
}

.booking-id-tag {
  font-family: monospace;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.booking-summary-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.booking-summary-icon {
  font-size: 2.5rem;
}

.booking-summary-title {
  font-weight: 700;
  color: #333;
  font-size: 1.1rem;
}

.booking-summary-subtitle {
  color: #667eea;
  font-size: 0.95rem;
}

/* Messages Container */
.messages-container {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 25px;
}

.message-bubble {
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 15px;
  position: relative;
}

.message-bubble.user {
  background: #f5f5f5;
  border-left: 4px solid #ccc;
}

.message-bubble.admin {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #667eea;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sender-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.sender-badge.admin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sender-badge.user {
  background: #e0e0e0;
  color: #555;
}

.sender-name {
  font-weight: 600;
  color: #333;
}

.message-time {
  font-size: 0.8rem;
  color: #999;
  margin-left: auto;
}

.message-body {
  color: #444;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Reply Section */
.reply-section {
  padding-top: 25px;
  border-top: 2px solid #f0f0f0;
}

.reply-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reply-input,
.reply-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.reply-input:focus,
.reply-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.reply-textarea {
  resize: none;
}

.closed-notice {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  color: #666;
  font-weight: 500;
  margin-top: 25px;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

/* Status Form */
.status-form,
.progress-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-select,
.role-select,
.progress-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
  font-family: inherit;
}

.status-select:focus,
.role-select:focus,
.progress-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.progress-textarea {
  resize: none;
}

/* Progress Timeline */
.progress-timeline {
  max-height: 300px;
  overflow-y: auto;
}

.progress-item {
  border-left: 3px solid #667eea;
  padding-left: 15px;
  padding-bottom: 15px;
  margin-bottom: 15px;
  position: relative;
}

.progress-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
}

.progress-item::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #667eea;
}

.progress-role-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 6px;
}

.progress-time {
  font-size: 0.8rem;
  color: #999;
}

.no-progress {
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  padding: 20px 0;
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
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn-purple:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.btn-booking {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-booking:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-loading {
  text-align: center;
  padding: 40px;
}

.modal-error {
  text-align: center;
  color: #ff6b6b;
  padding: 40px;
}

.booking-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.booking-detail-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.detail-value {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .ticket-detail-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
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

  .sidebar {
    grid-template-columns: 1fr;
  }

  .booking-detail-grid {
    grid-template-columns: 1fr;
  }

  .ticket-meta-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
