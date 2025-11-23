<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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
      </div>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading booking details...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="bookingData" class="main-content">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <router-link to="/" class="breadcrumb-link">Home</router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link to="/bookings" class="breadcrumb-link">All Bookings</router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-active">Booking Detail</span>
      </nav>

      <!-- Booking Header -->
      <div class="booking-header">
        <div class="header-flex">
          <div>
            <div class="booking-code">{{ bookingData.bookingCode || bookingData.bookingId }}</div>
            <span class="status-badge" :class="getStatusClass(bookingData.status)">
              {{ getStatusText(bookingData.status) }}
            </span>
          </div>
          <div class="timestamp-info">
            <div><strong>Created:</strong> {{ formatDateTime(bookingData.createdAt) }}</div>
          </div>
        </div>
      </div>

      <!-- Flight Information -->
      <div class="info-card">
        <div class="info-card-title">
          ✈️ Flight Information
        </div>

        <div class="route-display">
          <div class="airport-box">
            <div class="airport-code">{{ bookingData.originAirportCode }}</div>
            <div class="airport-name">{{ bookingData.originAirportName }}</div>
          </div>
          <div class="route-arrow">→</div>
          <div class="airport-box">
            <div class="airport-code">{{ bookingData.destinationAirportCode }}</div>
            <div class="airport-name">{{ bookingData.destinationAirportName }}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">🏢 Airline</div>
            <div class="info-value">{{ flightData?.airlineName || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">✈️ Aircraft</div>
            <div class="info-value">{{ flightData?.aircraftInfo?.model || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📅 Departure</div>
            <div class="info-value">{{ formatDateTime(bookingData.departureTime) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📅 Arrival</div>
            <div class="info-value">{{ formatDateTime(bookingData.arrivalTime) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">🏢 Terminal</div>
            <div class="info-value">{{ flightData?.terminal || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">🚪 Gate</div>
            <div class="info-value">{{ flightData?.gate || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">🧳 Baggage</div>
            <div class="info-value">{{ flightData?.baggageAllowance ? `${flightData.baggageAllowance} kg` : '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">✅ Flight Status</div>
            <div class="info-value">{{ flightData?.statusText || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- Class & Pricing -->
      <div class="info-card">
        <div class="info-card-title">
          ⭐ Class & Pricing
        </div>
        <div class="class-pricing-card">
          <div>
            <div class="class-info">{{ bookingData.className }}</div>
            <div>👥 {{ bookingData.passengerCount }} Passengers</div>
          </div>
          <div class="price-info">
            <div class="price-label">Total Price</div>
            <div class="price-value">Rp {{ formatPrice(bookingData.totalPrice) }}</div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="info-card">
        <div class="info-card-title">
          📋 Contact Information
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">📧 Email Address</div>
            <div class="info-value">{{ bookingData.contactEmail }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📱 Phone Number</div>
            <div class="info-value">{{ bookingData.contactPhone }}</div>
          </div>
        </div>
      </div>

      <!-- Passenger Details -->
      <div class="info-card">
        <div class="info-card-title">
          👥 Passenger Details
          <span class="badge-count">{{ bookingData.passengerCount }} Passengers</span>
        </div>
        <div class="passenger-list">
          <div
            v-for="(passenger, index) in bookingData.passengers"
            :key="index"
            class="passenger-card"
          >
            <div class="passenger-header">
              <div class="passenger-name">
                👤 Passenger {{ index + 1 }}
              </div>
              <div class="seat-badge">
                📍 {{ getSeatCodes(passenger.seatCodes) }}
              </div>
            </div>
            <div class="passenger-details">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">{{ passenger.fullName }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Birth Date</div>
                <div class="info-value">{{ formatDate(passenger.birthDate) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">{{ passenger.genderText }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">ID/Passport</div>
                <div class="info-value">{{ passenger.idPassport }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Actions -->
      <div class="info-card">
        <div class="info-card-title">
          ⚙️ Available Actions
        </div>
        <div class="action-buttons">
          <div
            class="action-card update"
            :class="{ disabled: !canUpdate }"
            @click="updateBooking"
          >
            <div class="action-icon update-icon">✏️</div>
            <div class="action-title">Update Booking</div>
            <div class="action-desc">Modify booking info, passengers or seats</div>
          </div>
          <div
            class="action-card cancel"
            :class="{ disabled: !canCancel }"
            @click="showCancelModal"
          >
            <div class="action-icon cancel-icon">❌</div>
            <div class="action-title">Cancel Booking</div>
            <div class="action-desc">Cancel this booking</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <div class="error-icon">❌</div>
      <h3 class="error-title">Booking Not Found</h3>
      <p class="error-text">The booking you're looking for doesn't exist or has been removed</p>
      <router-link to="/bookings" class="btn-back">← Back to Bookings</router-link>
    </div>

    <!-- Cancel Modal -->
    <div v-if="cancelModalVisible" class="modal-overlay" @click.self="closeCancelModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon">⚠️</div>
          <h2 class="modal-title">Confirm Booking Cancellation</h2>
        </div>
        <div class="modal-body">
          <p class="modal-text">
            Are you sure you want to cancel booking
            <strong>{{ bookingData?.bookingCode || bookingData?.bookingId }}</strong>?
          </p>

          <div class="booking-info">
            <div>📍 {{ bookingData?.originAirportCode }} → {{ bookingData?.destinationAirportCode }}</div>
            <div>🔖 Class: {{ bookingData?.className }}</div>
            <div>📊 Status: {{ getStatusText(bookingData?.status) }}</div>
            <div>👥 {{ bookingData?.passengerCount }} passengers</div>
            <div>💰 Total: Rp {{ formatPrice(bookingData?.totalPrice || 0) }}</div>
          </div>

          <div class="warning-box">
            <span>⚠️</span>
            <div>
              <strong>This action will cancel the booking. This action cannot be undone.</strong>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="closeCancelModal">
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
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import type { BookingResponse } from '@/interfaces/booking.interface'

const route = useRoute()
const router = useRouter()

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'
// State
const loading = ref(true)
const bookingData = ref<BookingResponse | null>(null)
const flightData = ref<any>(null)
const cancelModalVisible = ref(false)

// Computed
const canUpdate = computed(() => {
  if (!bookingData.value) return false
  // Can update if status is Unpaid (1) or Paid (2)
  return bookingData.value.status === 1 || bookingData.value.status === 2
})

const canCancel = computed(() => {
  if (!bookingData.value) return false
  // Can cancel if status is Unpaid (1) or Paid (2)
  return bookingData.value.status === 1 || bookingData.value.status === 2
})

// Methods
const loadBookingDetail = async () => {
  try {
    const bookingId = route.params.id as string

    // Load booking data
    const bookingResponse = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`)
    bookingData.value = bookingResponse.data

    // Load flight data
    if (bookingData.value) {  // ✅ Null check
      try {
        const flightResponse = await axios.get(
          `${API_BASE_URL}/bookings/flight-info/${bookingData.value.flightId}`
        )
        flightData.value = flightResponse.data
      } catch (error) {
        console.error('Error loading flight data:', error)
        // Continue even if flight data fails
      }
    }
  } catch (error: any) {
    console.error('Error loading booking:', error)
    bookingData.value = null
  } finally {
    loading.value = false
  }
}

const updateBooking = () => {
  if (!canUpdate.value) {
    alert('Cannot update cancelled or rescheduled booking')
    return
  }

  router.push(`/bookings/${bookingData.value?.bookingId}/update`)
}

const showCancelModal = () => {
  if (!canCancel.value) {
    alert('Only Unpaid or Paid bookings can be cancelled')
    return
  }

  cancelModalVisible.value = true
}

const closeCancelModal = () => {
  cancelModalVisible.value = false
}

const confirmCancelBooking = async () => {
  if (!bookingData.value) return

  try {
    await axios.delete(`${API_BASE_URL}/bookings/${bookingData.value.bookingId}`)
    alert('✅ Booking cancelled successfully!')
    router.push('/bookings')
  } catch (error: any) {
    console.error('Error cancelling booking:', error)
    alert('❌ Failed to cancel booking: ' + (error.response?.data?.error || error.message))
  } finally {
    closeCancelModal()
  }
}

const getSeatCodes = (seatCodes: string[]) => {
  if (!seatCodes || seatCodes.length === 0) return 'Not assigned'
  return seatCodes.map((s) => s.substring(s.lastIndexOf('-') + 1)).join(', ')
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

const getStatusText = (status?: number): string => {
  if (!status) return 'Unknown'
  const statusMap: Record<number, string> = {
    1: 'Unpaid',
    2: 'Paid',
    3: 'Cancelled',
    4: 'Rescheduled'
  }
  return statusMap[status] || 'Unknown'
}

const formatDateTime = (dateTimeString?: string): string => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price)
}

// Lifecycle
onMounted(async () => {
  await loadBookingDetail()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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
}

.nav-links a:hover,
.nav-links a.active {
  background: rgba(255, 255, 255, 0.2);
}

/* Breadcrumb */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: white;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.breadcrumb-link:hover {
  opacity: 0.8;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-active {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Main Content */
.main-content {
  padding-bottom: 2rem;
}

/* Booking Header */
.booking-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.booking-code {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
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

.timestamp-info {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Info Card */
.info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-count {
  background: #667eea;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-left: auto;
}

/* Route Display */
.route-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.airport-box {
  text-align: center;
  flex: 1;
}

.airport-code {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
}

.airport-name {
  font-size: 1rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.route-arrow {
  font-size: 2rem;
  color: #667eea;
  padding: 0 2rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.info-value {
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

/* Class Pricing Card */
.class-pricing-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-info {
  font-size: 1.3rem;
  font-weight: 700;
}

.price-info {
  text-align: right;
}

.price-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.price-value {
  font-size: 2rem;
  font-weight: 700;
}

/* Passenger List */
.passenger-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.passenger-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
}

.passenger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.passenger-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #667eea;
}

.seat-badge {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.passenger-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Action Buttons */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.action-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card.update {
  border-color: #667eea;
}

.action-card.update:hover:not(.disabled) {
  background: #f5f5ff;
}

.action-card.cancel {
  border-color: #ef4444;
}

.action-card.cancel:hover:not(.disabled) {
  background: #fff5f5;
}

.action-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.update-icon {
  color: #667eea;
}

.cancel-icon {
  color: #ef4444;
}

.action-title {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.action-desc {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Error State */
.error-state {
  background: white;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: 20px;
}

.error-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.error-text {
  color: #666;
  margin-bottom: 20px;
}

.btn-back {
  background: #667eea;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #4f46e5;
  transform: translateY(-2px);
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Responsive */
@media (max-width: 768px) {
  .header-flex {
    flex-direction: column;
    gap: 15px;
  }

  .route-display {
    flex-direction: column;
    gap: 20px;
  }

  .route-arrow {
    transform: rotate(90deg);
    padding: 1rem 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .class-pricing-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .price-info {
    text-align: center;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 20px;
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
