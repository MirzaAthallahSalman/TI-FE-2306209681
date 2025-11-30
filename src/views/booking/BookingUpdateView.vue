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
        <router-link v-if="authStore.canAccessHome" to="/">Home</router-link>
        <router-link v-if="authStore.canAccessAirplanes" to="/airplanes">Airplanes</router-link>
        <router-link to="/flights">Flights</router-link>
        <router-link to="/bookings" class="active">Flight Bookings</router-link>
        <router-link v-if="authStore.canAccessStatistics" to="/statistics">📊 Statistics</router-link>
        <router-link to="/tickets">🎫 Support</router-link>
        <div class="user-section" v-if="authStore.isAuthenticated">
          <span class="user-role">{{ authStore.user?.role }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading booking data...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="bookingData" class="main-content">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <router-link to="/" class="breadcrumb-link">Home</router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link to="/bookings" class="breadcrumb-link">Bookings</router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link :to="`/bookings/${bookingId}`" class="breadcrumb-link">
          {{ bookingData.bookingCode }}
        </router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-active">Update</span>
      </nav>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">✏️ Update Booking</div>
        <div class="page-subtitle">Modify booking details, passengers, and seat assignments</div>
      </div>

      <!-- Alert Messages -->
      <div v-if="alertMessage" :class="['alert', `alert-${alertType}`]">
        <strong>{{ alertType === 'success' ? 'Success!' : alertType === 'warning' ? 'Warning!' : 'Error!' }}</strong>
        {{ alertMessage }}
      </div>

      <!-- Update Form -->
      <form @submit.prevent="submitUpdate">
        <!-- Booking Information (Read-only) -->
        <div class="form-section">
          <div class="section-title">
            ℹ️ Booking Information
          </div>
          <div class="info-box">
            <p>Basic booking details (cannot be modified)</p>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Booking Code</label>
              <input type="text" class="form-control" :value="bookingData.bookingCode" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Flight Number</label>
              <input type="text" class="form-control" :value="bookingData.flightNumber" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Class</label>
              <input type="text" class="form-control" :value="bookingData.className" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <input type="text" class="form-control" :value="bookingData.statusText" readonly>
            </div>
          </div>
          <div class="form-grid" style="margin-top: 1rem;">
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">Route</label>
              <input
                type="text"
                class="form-control"
                :value="`${bookingData.originAirportCode} → ${bookingData.destinationAirportCode}`"
                readonly
              >
            </div>
            <div class="form-group">
              <label class="form-label">Departure</label>
              <input type="text" class="form-control" :value="formatDateTime(bookingData.departureTime)" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Arrival</label>
              <input type="text" class="form-control" :value="formatDateTime(bookingData.arrivalTime)" readonly>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="form-section">
          <div class="section-title">
            📋 Contact Information
          </div>
          <div class="info-box">
            <p>Update contact details for this booking</p>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Contact Email *</label>
              <input
                v-model="contactEmail"
                type="email"
                class="form-control"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">Contact Phone *</label>
              <input
                v-model="contactPhone"
                type="tel"
                class="form-control"
                required
              >
            </div>
          </div>
        </div>

        <!-- Passengers & Seats -->
        <div class="form-section">
          <div class="section-title">
            👥 Passengers & Seats
          </div>
          <div class="info-box">
            <p>Add, remove, or update passengers and their seat assignments. Available seats: <strong>{{ totalAvailableSeats }}</strong></p>
          </div>

          <div class="passengers-container">
            <div
              v-for="(passenger, index) in passengers"
              :key="passenger.id"
              class="passenger-card"
            >
              <div class="passenger-header">
                <div class="passenger-number">Passenger {{ index + 1 }}</div>
                <button
                  type="button"
                  class="btn-remove-passenger"
                  @click="removePassenger(index)"
                  :disabled="passengers.length <= 1"
                >
                  🗑️ Remove
                </button>
              </div>

              <!-- Existing Passenger -->
              <div v-if="passenger.isExisting" class="existing-passenger-info">
                <div><strong>Name:</strong> {{ passenger.name }}</div>
                <div><strong>ID/Passport:</strong> {{ passenger.idPassport }}</div>
                <div><strong>Gender:</strong> {{ passenger.gender }}</div>
              </div>

              <!-- New Passenger -->
              <div v-else class="form-group">
                <label class="form-label">Select Passenger *</label>
                <select
                  v-model="passenger.passengerId"
                  class="form-control"
                  @change="onPassengerChange(index)"
                  required
                >
                  <option value="">Choose passenger...</option>
                  <option
                    v-for="p in availablePassengersList"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.fullName }} ({{ p.genderText }})
                  </option>
                </select>
              </div>

              <!-- Seat Selection -->
              <div class="seat-selection">
                <div class="form-group">
                  <label class="form-label">Seat *</label>
                  <select
                    v-model="passenger.seatCode"
                    class="form-control"
                    required
                  >
                    <option value="">Choose seat...</option>
                    <option
                      v-for="seat in getAvailableSeatsForPassenger(index)"
                      :key="seat.seatCode"
                      :value="seat.seatCode"
                    >
                      {{ seat.seatCodeShort }}
                    </option>
                  </select>
                </div>
                <div v-if="passenger.currentSeat" class="current-seat-info">
                  <label class="form-label">Current Seat</label>
                  <div class="current-seat-badge">
                    ✅ {{ getSeatShort(passenger.currentSeat) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="btn-add-passenger"
            @click="addNewPassenger"
            :disabled="passengers.length >= totalAvailableSeats"
          >
            ➕ Add Passenger
          </button>
        </div>

        <!-- Price Summary -->
        <div class="form-section">
          <div class="section-title">
            🧾 Price Summary
          </div>
          <div class="price-summary">
            <div class="price-row">
              <span class="price-label">Class Price per Passenger:</span>
              <span class="price-value">Rp {{ formatPrice(bookingData.classPrice) }}</span>
            </div>
            <div class="price-row">
              <span class="price-label">Number of Passengers:</span>
              <span class="price-value">{{ passengers.length }}</span>
            </div>
            <div class="total-price">
              <span class="total-label">Total Price:</span>
              <span class="total-amount">Rp {{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button type="submit" class="btn btn-save" :disabled="submitting">
            {{ submitting ? '⏳ Saving...' : '✅ Save Updates' }}
          </button>
          <button type="button" class="btn btn-cancel" @click="cancelUpdate">
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth/authStore'
import type { BookingUpdateForm } from '@/interfaces/booking.interface'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Logout handler
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// API Base URL
const API_BASE_URL = 'http://2306209681-be.hafizmuh.site/api'
// State
const loading = ref(true)
const submitting = ref(false)
const bookingId = ref(route.params.id as string)
const bookingData = ref<BookingUpdateForm | null>(null)
const availablePassengersList = ref<any[]>([])
const availableSeatsData = ref<any[]>([])
const alertMessage = ref('')
const alertType = ref<'success' | 'warning' | 'error'>('success')

// Form Data
const contactEmail = ref('')
const contactPhone = ref('')
const passengers = ref<Array<{
  id: number
  passengerId: string
  seatCode: string
  currentSeat: string | null
  isExisting: boolean
  name?: string
  idPassport?: string
  gender?: string
}>>([])

let passengerIdCounter = 0
const removedPassengerIds = ref<string[]>([])

// Computed
const totalAvailableSeats = computed(() => {
  if (!bookingData.value) return 0
  return bookingData.value.availableSeats + bookingData.value.passengers.length
})

const totalPrice = computed(() => {
  if (!bookingData.value) return 0
  return bookingData.value.classPrice * passengers.value.length
})

// Methods
const loadBookingData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId.value}/update`)
    const data = response.data
    bookingData.value = data

    // Populate form - use data directly instead of bookingData.value
    contactEmail.value = data.contactEmail
    contactPhone.value = data.contactPhone

    // Populate passengers
    passengers.value = data.passengers.map((p: any) => ({
      id: ++passengerIdCounter,
      passengerId: p.passengerId,
      seatCode: p.currentSeatCode || '',
      currentSeat: p.currentSeatCode,
      isExisting: true,
      name: p.fullName,
      idPassport: p.idPassport,
      gender: p.genderText
    }))
  } catch (error: any) {
    console.error('Error loading booking:', error)
    showAlert('error', error.response?.data?.error || 'Failed to load booking data')
  }
}

const loadAvailablePassengers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/available-passengers`)
    availablePassengersList.value = response.data
  } catch (error) {
    console.error('Error loading passengers:', error)
  }
}

const loadAvailableSeats = async () => {
  if (!bookingData.value) return

  try {
    const response = await axios.get(
      `${API_BASE_URL}/bookings/available-seats/${bookingData.value.classFlightId}`
    )
    availableSeatsData.value = response.data
  } catch (error) {
    console.error('Error loading seats:', error)
  } finally {
    loading.value = false
  }
}

const addNewPassenger = () => {
  if (passengers.value.length >= totalAvailableSeats.value) {
    showAlert('warning', 'No more available seats in this class')
    return
  }

  passengers.value.push({
    id: ++passengerIdCounter,
    passengerId: '',
    seatCode: '',
    currentSeat: null,
    isExisting: false
  })
}

const removePassenger = (index: number) => {
  if (passengers.value.length <= 1) {
    showAlert('warning', 'Booking must have at least one passenger')
    return
  }

  const passenger = passengers.value[index]
  if (!passenger) return // ✅ Null check

  if (passenger.isExisting) {
    removedPassengerIds.value.push(passenger.passengerId)
  }

  passengers.value.splice(index, 1)
}

const onPassengerChange = (index: number) => {
  const passenger = passengers.value[index]
  if (passenger) { // ✅ Null check
    passenger.seatCode = ''
  }
}

const getAvailableSeatsForPassenger = (index: number) => {
  const currentPassenger = passengers.value[index]
  if (!currentPassenger) return [] // ✅ Early return if undefined

  const selectedSeats = passengers.value
    .filter((_, i) => i !== index)
    .map((p) => p.seatCode)
    .filter((s) => s !== '')

  let available = availableSeatsData.value.filter(
    (seat) => !selectedSeats.includes(seat.seatCode)
  )

  // Include current seat if exists
  if (currentPassenger.currentSeat) {
    const currentSeatObj = availableSeatsData.value.find(
      (s) => s.seatCode === currentPassenger.currentSeat
    )
    if (currentSeatObj && !available.some((s) => s.seatCode === currentPassenger.currentSeat)) {
      available = [currentSeatObj, ...available]
    }
  }

  return available
}

const getSeatShort = (seatCode: string) => {
  if (!seatCode) return ''
  return seatCode.substring(seatCode.lastIndexOf('-') + 1)
}

const submitUpdate = async () => {
  try {
    submitting.value = true

    // Validate
    for (const passenger of passengers.value) {
      if (!passenger.passengerId || !passenger.seatCode) {
        showAlert('error', 'Please fill all passenger and seat fields')
        return
      }
    }

    // Build update data
    const updateData: any = {
      contactEmail: contactEmail.value,
      contactPhone: contactPhone.value,
      passengers: []
    }

    // Add passenger updates
    passengers.value.forEach((passenger) => {
      let action = 'update'
      if (!passenger.isExisting) {
        action = 'add'
      } else if (passenger.currentSeat !== passenger.seatCode) {
        action = 'update'
      }

      updateData.passengers.push({
        passengerId: passenger.passengerId,
        seatCode: passenger.seatCode,
        action: action
      })
    })

    // Add removed passengers
    removedPassengerIds.value.forEach((passengerId) => {
      updateData.passengers.push({
        passengerId: passengerId,
        seatCode: '',
        action: 'remove'
      })
    })

    // Submit
    await axios.put(`${API_BASE_URL}/bookings/${bookingId.value}/update`, updateData)

    showAlert('success', 'Booking updated successfully!')

    // Redirect after 1.5 seconds
    setTimeout(() => {
      router.push(`/bookings/${bookingId.value}`)
    }, 1500)
  } catch (error: any) {
    console.error('Error updating booking:', error)
    showAlert('error', error.response?.data?.error || 'Failed to update booking')
  } finally {
    submitting.value = false
  }
}

const cancelUpdate = () => {
  if (confirm('Discard changes and go back?')) {
    router.push(`/bookings/${bookingId.value}`)
  }
}

const showAlert = (type: 'success' | 'warning' | 'error', message: string) => {
  alertType.value = type
  alertMessage.value = message
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alertMessage.value = ''
  }, 5000)
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

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadBookingData(),
    loadAvailablePassengers()
  ])
  await loadAvailableSeats()
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Main Content */
.main-content {
  padding-bottom: 2rem;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6b7280;
}

/* Alert */
.alert {
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.alert-success {
  background: #d1f2eb;
  color: #0c5460;
  border-left: 4px solid #10b981;
}

.alert-warning {
  background: #fff3cd;
  color: #856404;
  border-left: 4px solid #f59e0b;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #ef4444;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.info-box {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.info-box p {
  margin: 0;
  color: #1e40af;
  font-size: 0.9rem;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-control {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:read-only {
  background: #f9fafb;
  cursor: not-allowed;
}

/* Passengers Container */
.passengers-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.passenger-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
}

.passenger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.passenger-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: #667eea;
}

.btn-remove-passenger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove-passenger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn-remove-passenger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.existing-passenger-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.existing-passenger-info div {
  margin-bottom: 0.5rem;
}

.seat-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.current-seat-info {
  display: flex;
  flex-direction: column;
}

.current-seat-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-add-passenger {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.btn-add-passenger:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.btn-add-passenger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Price Summary */
.price-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-label {
  font-size: 1rem;
}

.price-value {
  font-size: 1rem;
  font-weight: 600;
}

.total-price {
  display: flex;
  justify-content: space-between;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
  padding-top: 1rem;
  margin-top: 1rem;
}

.total-label {
  font-size: 1.2rem;
  font-weight: 600;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  background: #667eea;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-cancel {
  background: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
  }

  .seat-selection {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
