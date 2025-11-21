<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
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
        <router-link to="/bookings" class="active">Flight Bookings</router-link>
        <router-link to="/statistics">📊 Statistics</router-link>
      </div>
    </nav>

    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">📋</div>
        <div class="header-title">Flight Bookings</div>
      </div>
      <div class="header-actions">
        <router-link to="/statistics" class="btn-statistics">
          📊 View Analytics
        </router-link>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card" @click="$router.push('/statistics')">
        <div class="stat-icon total">
          📋
        </div>
        <div class="stat-content">
          <div class="stat-label">Total Bookings</div>
          <div class="stat-value">{{ statistics.total }}</div>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/statistics')">
        <div class="stat-icon paid">
          ✅
        </div>
        <div class="stat-content">
          <div class="stat-label">Paid</div>
          <div class="stat-value">{{ statistics.paid }}</div>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/statistics')">
        <div class="stat-icon unpaid">
          ⏳
        </div>
        <div class="stat-content">
          <div class="stat-label">Unpaid</div>
          <div class="stat-value">{{ statistics.unpaid }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <!-- View Toggle -->
      <div class="view-toggle">
        <div class="toggle-buttons">
          <button class="toggle-btn active">
            📋 View Bookings
          </button>
        </div>
        <button class="btn-view-analytics" @click="$router.push('/statistics')">
          📈 View Detailed Analytics
        </button>
      </div>

      <div class="filter-grid">
        <div class="filter-group">
          <label>✈️ Flight Number</label>
          <input
            v-model="filters.flightNumber"
            type="text"
            placeholder="Search by flight number..."
          >
        </div>

        <div class="filter-group">
          <label>📊 Status</label>
          <select v-model="filters.status">
            <option value="">All Statuses</option>
            <option value="1">Unpaid</option>
            <option value="2">Paid</option>
            <option value="3">Cancelled</option>
            <option value="4">Rescheduled</option>
          </select>
        </div>

        <div class="filter-group">
          <label>📧 Contact Email</label>
          <input
            v-model="filters.email"
            type="text"
            placeholder="Search by email..."
          >
        </div>

        <div class="filter-group">
          <label>🔍 Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Booking ID, email, phone..."
          >
        </div>
      </div>

      <div class="filter-actions">
        <button class="btn-reset" @click="applyFilters">
          🔍 Search
        </button>
        <button class="btn-reset" @click="resetFilters">
          🔄 Reset
        </button>
      </div>

      <!-- Show Inactive Toggle -->
      <div style="margin-top: 15px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input
            v-model="filters.showInactive"
            type="checkbox"
            style="width: 18px; height: 18px; cursor: pointer;"
          >
          <span style="font-weight: 600; color: #555;">🚫 Show Inactive</span>
          <span style="color: #999; font-size: 0.85rem;">Active Only</span>
        </label>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="bookingStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Loading bookings...</p>
    </div>

    <!-- Bookings Table -->
    <div v-else-if="filteredBookings.length > 0" class="bookings-table-container">
      <table class="bookings-table">
        <thead>
          <tr>
            <th>NO</th>
            <th>BOOKING ID</th>
            <th>FLIGHT NUMBER</th>
            <th>ROUTE</th>
            <th>CLASS</th>
            <th>CONTACT INFO</th>
            <th>PASSENGERS</th>
            <th>TOTAL PRICE</th>
            <th>STATUS</th>
            <th>CREATED AT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, index) in filteredBookings" :key="booking.bookingId">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="booking-code">
                {{ checkIfTwoWayBooking(booking) ? '🔄 ' : '' }}{{ booking.bookingCode || booking.bookingId }}
              </div>
              <div style="font-size: 0.8rem; color: #999;">{{ booking.bookingId }}</div>
              <span
                v-if="checkIfTwoWayBooking(booking)"
                style="font-size: 0.75rem; color: #667eea; font-weight: 600;"
              >
                Round Trip
              </span>
            </td>
            <td>
              <strong>{{ booking.flightNumber || booking.flightId }}</strong>
            </td>
            <td>
              <div class="route">
                <span>{{ booking.originAirportCode || '-' }}</span>
                <span>→</span>
                <span>{{ booking.destinationAirportCode || '-' }}</span>
              </div>
            </td>
            <td>{{ booking.className || '-' }}</td>
            <td>
              <div>📧 {{ booking.contactEmail || '-' }}</div>
              <div style="font-size: 0.85rem; color: #999;">📱 {{ booking.contactPhone || '-' }}</div>
            </td>
            <td>
              <strong style="color: #667eea;">{{ booking.passengerCount }}</strong> passengers
            </td>
            <td>
              <strong style="color: #10b981;">{{ bookingStore.formatPrice(booking.totalPrice) }}</strong>
            </td>
            <td>
              <span
                class="status-badge"
                :class="getStatusClass(booking.status)"
              >
                {{ bookingStore.getBookingStatusText(booking.status) }}
              </span>
            </td>
            <td>{{ bookingStore.formatDateTime(booking.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  class="btn btn-detail"
                  @click="viewDetail(booking.bookingId)"
                >
                  ℹ️ Detail
                </button>
                <button
                  class="btn btn-cancel"
                  @click="showCancelModal(booking)"
                  :disabled="booking.status !== 1 && booking.status !== 2"
                >
                  ✖️ Cancel
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="bookings-table-container empty-state">
      <div class="empty-icon">📋</div>
      <h3 class="empty-title">No Bookings Found</h3>
      <p class="empty-text">No bookings match your search criteria</p>
      <button class="btn-reset" @click="resetFilters" style="margin-top: 20px;">
        🔄 Clear Filters
      </button>
    </div>

    <!-- Cancel Booking Modal -->
    <div v-if="showModal && selectedBooking" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon">⚠️</div>
          <h2 class="modal-title">Confirm Booking Cancellation</h2>
        </div>
        <div class="modal-body">
          <p class="modal-text">
            Are you sure you want to cancel booking
            <strong>{{ selectedBooking.bookingCode || selectedBooking.bookingId }}</strong>?
          </p>

          <div class="booking-info">
            <div>📍 {{ selectedBooking.originAirportCode }} → {{ selectedBooking.destinationAirportCode }}</div>
            <div>🔖 Class: {{ selectedBooking.className }}</div>
            <div>📊 Status: {{ bookingStore.getBookingStatusText(selectedBooking.status) }}</div>
            <div>👥 {{ selectedBooking.passengerCount }} passengers</div>
            <div>💰 Total: {{ bookingStore.formatPrice(selectedBooking.totalPrice) }}</div>
          </div>

          <div class="warning-box">
            <span>⚠️</span>
            <div>
              <strong>This action will cancel the booking. This action cannot be undone.</strong>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="closeModal">
            Cancel
          </button>
          <button class="modal-btn modal-btn-confirm" @click="confirmCancelBooking">
            ❌ Cancel Booking
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking/bookingStore'
import type { BookingResponse } from '@/interfaces/booking.interface'

const router = useRouter()
const bookingStore = useBookingStore()

// State
const showModal = ref(false)
const selectedBooking = ref<BookingResponse | null>(null)

const filters = ref({
  flightNumber: '',
  status: '',
  email: '',
  search: '',
  showInactive: false
})

// Computed
const statistics = computed(() => {
  const bookings = bookingStore.bookings
  return {
    total: bookings.length,
    paid: bookings.filter(b => b.status === 2).length,
    unpaid: bookings.filter(b => b.status === 1).length
  }
})

const filteredBookings = computed(() => {
  let result = bookingStore.bookings

  // Filter by flight number
  if (filters.value.flightNumber) {
    const searchTerm = filters.value.flightNumber.toLowerCase()
    result = result.filter(b =>
      (b.flightNumber || b.flightId || '').toLowerCase().includes(searchTerm)
    )
  }

  // Filter by status
  if (filters.value.status) {
    result = result.filter(b => b.status === Number(filters.value.status))
  }

  // Filter by email
  if (filters.value.email) {
    const searchTerm = filters.value.email.toLowerCase()
    result = result.filter(b =>
      (b.contactEmail || '').toLowerCase().includes(searchTerm)
    )
  }

  // Search filter (booking ID, email, phone)
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(b =>
      (b.bookingId || '').toLowerCase().includes(searchTerm) ||
      (b.bookingCode || '').toLowerCase().includes(searchTerm) ||
      (b.contactEmail || '').toLowerCase().includes(searchTerm) ||
      (b.contactPhone || '').toLowerCase().includes(searchTerm)
    )
  }

  // Show inactive filter
  if (!filters.value.showInactive) {
    result = result.filter(b => b.status === 1 || b.status === 2)
  }

  return result
})

// Methods
const applyFilters = () => {
  // Filters are reactive, so no need to do anything here
  // This is just for the button click
}

const resetFilters = () => {
  filters.value = {
    flightNumber: '',
    status: '',
    email: '',
    search: '',
    showInactive: false
  }
}

const viewDetail = (bookingId: string) => {
  router.push(`/bookings/${bookingId}`)
}

const showCancelModal = (booking: BookingResponse) => {
  if (booking.status !== 1 && booking.status !== 2) {
    alert('Only Unpaid or Paid bookings can be cancelled')
    return
  }
  selectedBooking.value = booking
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedBooking.value = null
}

const confirmCancelBooking = async () => {
  if (!selectedBooking.value) {
    alert('No booking selected for cancellation')
    return
  }

  try {
    await bookingStore.cancelBooking(selectedBooking.value.bookingId)
    alert('✅ Booking cancelled successfully!')
    closeModal()
    await bookingStore.fetchBookings() // Reload bookings
  } catch (error: any) {
    console.error('Error cancelling booking:', error)
    alert('❌ Failed to cancel booking: ' + (error.response?.data?.message || error.message))
    closeModal()
  }
}

const checkIfTwoWayBooking = (booking: BookingResponse): boolean => {
  // Check if there's another booking with:
  // - Same email & phone
  // - Created within 1 minute
  // - Reverse route
  const potentialPair = bookingStore.bookings.find(b =>
    b.bookingId !== booking.bookingId &&
    b.contactEmail === booking.contactEmail &&
    b.contactPhone === booking.contactPhone &&
    b.originAirportCode === booking.destinationAirportCode &&
    b.destinationAirportCode === booking.originAirportCode &&
    Math.abs(new Date(b.createdAt).getTime() - new Date(booking.createdAt).getTime()) < 60000
  )

  return !!potentialPair
}

const getStatusClass = (status: number): string => {
  const statusMap: Record<number, string> = {
    1: 'status-unpaid',
    2: 'status-paid',
    3: 'status-cancelled',
    4: 'status-rescheduled'
  }
  return statusMap[status] || ''
}

// Lifecycle
onMounted(async () => {
  await bookingStore.fetchBookings()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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
.nav-links a.active {
  background: rgba(255, 255, 255, 0.2);
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

.header-actions {
  display: flex;
  gap: 15px;
}

.btn-statistics {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.btn-statistics:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(17, 153, 142, 0.4);
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.paid {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.stat-icon.unpaid {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.view-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toggle-buttons {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.btn-view-analytics {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-view-analytics:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
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
  margin-bottom: 6px;
}

.filter-group input,
.filter-group select {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.btn-reset {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-reset:hover {
  background: #f5f5f5;
}

/* Bookings Table */
.bookings-table-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th {
  background: #f9f9f9;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.9rem;
}

.bookings-table td {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  color: #666;
}

.bookings-table tr:hover {
  background: #f9f9f9;
}

.booking-code {
  font-weight: 600;
  color: #667eea;
}

.route {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
}

.status-unpaid {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #d1f2eb;
  color: #0c5460;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-rescheduled {
  background: #cce5ff;
  color: #004085;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-detail {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-detail:hover:not(:disabled) {
  background: #1976d2;
  color: white;
}

.btn-cancel {
  background: #ffebee;
  color: #c62828;
}

.btn-cancel:hover:not(:disabled) {
  background: #c62828;
  color: white;
}

/* Cancel Modal */
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
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.modal-body {
  margin-bottom: 25px;
}

.modal-text {
  color: #555;
  font-size: 1rem;
  margin-bottom: 15px;
  text-align: center;
}

.booking-info {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  font-size: 0.9rem;
}

.booking-info div {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-box {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #856404;
  margin: 15px 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.modal-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.modal-btn-cancel:hover {
  background: #e0e0e0;
}

.modal-btn-confirm {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.modal-btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px;
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
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
  }

  .header-actions {
    flex-direction: column;
  }

  .view-toggle {
    flex-direction: column;
    gap: 15px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .bookings-table-container {
    overflow-x: scroll;
  }

  .modal-content {
    margin: 20px;
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
