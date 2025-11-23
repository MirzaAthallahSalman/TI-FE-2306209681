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

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading flight information...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <router-link to="/" class="breadcrumb-link">Home</router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link to="/flights" class="breadcrumb-link">Flights</router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-active">Book Flight</span>
      </nav>

      <!-- Booking Card -->
      <div class="booking-card">
        <!-- Header -->
        <div class="booking-header">
          <div class="booking-title">🎫 Book Your Flight</div>
          <div class="booking-subtitle">Complete your booking in just a few steps</div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="alert-error">
          {{ errorMessage }}
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps">
          <div
            v-for="step in steps"
            :key="step.number"
            class="step"
            :class="{ active: currentStep === step.number, completed: currentStep > step.number }"
          >
            <div class="step-circle">{{ step.number }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <!-- Flight Info Display -->
        <div v-if="flightData" class="flight-info-display">
          <div class="route-display">
            <div class="airport-info">
              <div class="airport-code">{{ flightData.originAirportCode }}</div>
              <div class="airport-name">{{ flightData.originAirportName }}</div>
            </div>
            <div class="route-arrow">✈️</div>
            <div class="airport-info">
              <div class="airport-code">{{ flightData.destinationAirportCode }}</div>
              <div class="airport-name">{{ flightData.destinationAirportName }}</div>
            </div>
          </div>

          <div class="flight-details-grid">
            <div class="detail-box">
              <div class="detail-label">Flight Number</div>
              <div class="detail-value">{{ flightData.flightNumber }}</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Airline</div>
              <div class="detail-value">{{ flightData.airlineName }}</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Departure</div>
              <div class="detail-value">{{ formatDateTime(flightData.departureTime) }}</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Arrival</div>
              <div class="detail-value">{{ formatDateTime(flightData.arrivalTime) }}</div>
            </div>
          </div>
        </div>

        <!-- Step 1: Select Class -->
        <div v-show="currentStep === 1" class="step-content">
          <h4 class="step-title">⭐ Select Class</h4>
          <div class="class-grid">
            <div
              v-for="classFlight in flightData?.classFlights"
              :key="classFlight.id"
              class="class-card"
              :class="{ selected: selectedClassFlightId === classFlight.id }"
              @click="selectClass(classFlight)"
            >
              <div class="class-name">{{ classFlight.className }}</div>
              <div class="class-price">Rp {{ formatPrice(classFlight.price) }}</div>
              <div class="class-seats">
                👥 {{ classFlight.availableSeats }} / {{ classFlight.totalSeats }} seats available
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Contact Info & Passenger Count -->
        <div v-show="currentStep === 2" class="step-content">
          <h4 class="step-title">📋 Contact Information</h4>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                v-model="contactEmail"
                type="email"
                class="form-control"
                placeholder="your.email@example.com"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input
                v-model="contactPhone"
                type="tel"
                class="form-control"
                placeholder="08123456789"
                pattern="[0-9]{10,15}"
                required
              >
            </div>
          </div>

          <h4 class="step-title" style="margin-top: 2rem;">👥 Number of Passengers</h4>
          <div class="passenger-counter">
            <button
              type="button"
              class="counter-btn"
              :disabled="passengerCount <= 1"
              @click="decreasePassenger"
            >
              −
            </button>
            <div class="counter-value">{{ passengerCount }}</div>
            <button
              type="button"
              class="counter-btn"
              :disabled="passengerCount >= maxPassengers"
              @click="increasePassenger"
            >
              +
            </button>
          </div>
          <p class="text-center text-muted">Maximum {{ maxPassengers }} passengers per booking</p>
        </div>

        <!-- Step 3: Select Passengers & Seats -->
        <div v-show="currentStep === 3" class="step-content">
          <h4 class="step-title">✅ Select Passengers & Seats</h4>
          <div class="passenger-list">
            <div
              v-for="(passenger, index) in passengerSelections"
              :key="index"
              class="passenger-item"
            >
              <div class="passenger-header">Passenger {{ index + 1 }}</div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Select Passenger</label>
                  <select
                    v-model="passenger.passengerId"
                    class="form-control"
                    @change="onPassengerChange(index)"
                    required
                  >
                    <option value="">Choose passenger...</option>
                    <option
                      v-for="p in availablePassengers"
                      :key="p.id"
                      :value="p.id"
                    >
                      {{ p.fullName }} ({{ p.genderText }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Select Seat</label>
                  <select
                    v-model="passenger.seatCode"
                    class="form-control"
                    :disabled="!passenger.passengerId"
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
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Confirmation -->
        <div v-show="currentStep === 4" class="step-content">
          <h4 class="step-title">✔️ Booking Summary</h4>

          <!-- Flight Summary -->
          <div class="summary-section">
            <div class="summary-title">Flight Information</div>
            <div class="summary-row">
              <span class="summary-label">Flight</span>
              <span class="summary-value">{{ flightData?.flightNumber }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Route</span>
              <span class="summary-value">
                {{ flightData?.originAirportCode }} → {{ flightData?.destinationAirportCode }}
              </span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Class</span>
              <span class="summary-value">{{ selectedClassName }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Departure</span>
              <span class="summary-value">{{ formatDateTime(flightData?.departureTime) }}</span>
            </div>
          </div>

          <!-- Contact Summary -->
          <div class="summary-section">
            <div class="summary-title">Contact Information</div>
            <div class="summary-row">
              <span class="summary-label">Email</span>
              <span class="summary-value">{{ contactEmail }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Phone</span>
              <span class="summary-value">{{ contactPhone }}</span>
            </div>
          </div>

          <!-- Passenger Summary -->
          <div class="summary-section">
            <div class="summary-title">Passengers & Seats</div>
            <div
              v-for="(passenger, index) in passengerSelections"
              :key="index"
              class="summary-row"
            >
              <span class="summary-label">Passenger {{ index + 1 }}</span>
              <span class="summary-value">
                {{ getPassengerName(passenger.passengerId) }} - Seat {{ getSeatShort(passenger.seatCode) }}
              </span>
            </div>
          </div>

          <!-- Total Price -->
          <div class="total-price">
            <div class="total-label">Total Price</div>
            <div class="total-amount">Rp {{ formatPrice(totalPrice) }}</div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <button
            v-show="currentStep > 1"
            type="button"
            class="btn btn-secondary"
            @click="previousStep"
          >
            ← Back
          </button>
          <div style="flex: 1;"></div>
          <button
            v-show="currentStep < 4"
            type="button"
            class="btn btn-primary"
            @click="nextStep"
          >
            Next →
          </button>
          <button
            v-show="currentStep === 4"
            type="button"
            class="btn btn-success"
            :disabled="submitting"
            @click="submitBooking"
          >
            {{ submitting ? '⏳ Processing...' : '✔️ Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon-success">✅</div>
          <h2 class="modal-title">Booking Successful!</h2>
        </div>
        <div class="modal-body">
          <p class="modal-text">Your booking has been created successfully.</p>
          <div class="booking-info">
            <div><strong>Booking Code:</strong> {{ bookingResult?.bookingCode }}</div>
            <div><strong>Total Price:</strong> Rp {{ formatPrice(bookingResult?.totalPrice || 0) }}</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-primary" @click="goToBookings">
            View Bookings
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
import type { BookingRequest, BookingResponse } from '@/interfaces/booking.interface'

const route = useRoute()
const router = useRouter()

// API Base URL
const API_BASE_URL = 'http://2306209681-be.hafizmuh.site/api'
// State
const loading = ref(true)
const errorMessage = ref('')
const currentStep = ref(1)
const flightData = ref<any>(null)
const availablePassengers = ref<any[]>([])
const availableSeatsData = ref<any[]>([])
const submitting = ref(false)
const showSuccessModal = ref(false)
const bookingResult = ref<BookingResponse | null>(null)

// Form Data
const selectedClassFlightId = ref<number | null>(null)
const selectedClassName = ref('')
const selectedClassPrice = ref(0)
const availableSeatsCount = ref(0)
const contactEmail = ref('')
const contactPhone = ref('')
const passengerCount = ref(1)
const passengerSelections = ref<Array<{ passengerId: string; seatCode: string }>>([
  { passengerId: '', seatCode: '' }
])

// Steps
const steps = [
  { number: 1, label: 'Select Class' },
  { number: 2, label: 'Contact Info' },
  { number: 3, label: 'Select Passengers' },
  { number: 4, label: 'Confirmation' }
]

// Computed
const maxPassengers = computed(() => {
  return availableSeatsCount.value > 0 ? Math.min(10, availableSeatsCount.value) : 10
})

const totalPrice = computed(() => {
  return selectedClassPrice.value * passengerCount.value
})

// Methods
const loadFlightInfo = async () => {
  try {
    const flightId = route.params.id as string
    const response = await axios.get(`${API_BASE_URL}/bookings/flight-info/${flightId}`)
    flightData.value = response.data
  } catch (error: any) {
    console.error('Error loading flight:', error)
    errorMessage.value = 'Failed to load flight information'
  } finally {
    loading.value = false
  }
}

const loadAvailablePassengers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/available-passengers`)
    availablePassengers.value = response.data
  } catch (error) {
    console.error('Error loading passengers:', error)
  }
}

const loadAvailableSeats = async () => {
  if (!selectedClassFlightId.value) return

  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/available-seats/${selectedClassFlightId.value}`)
    availableSeatsData.value = response.data
  } catch (error) {
    console.error('Error loading seats:', error)
  }
}

const selectClass = (classFlight: any) => {
  selectedClassFlightId.value = classFlight.id
  selectedClassName.value = classFlight.className
  selectedClassPrice.value = classFlight.price
  availableSeatsCount.value = classFlight.availableSeats
}

const decreasePassenger = () => {
  if (passengerCount.value > 1) {
    passengerCount.value--
    passengerSelections.value.pop()
  }
}

const increasePassenger = () => {
  if (passengerCount.value < maxPassengers.value) {
    passengerCount.value++
    passengerSelections.value.push({ passengerId: '', seatCode: '' })
  }
}

const onPassengerChange = (index: number) => {
  // Reset seat selection when passenger changes
  const passenger = passengerSelections.value[index]
  if (passenger) {
    passenger.seatCode = ''
  }
}

const getAvailableSeatsForPassenger = (index: number) => {
  const selectedSeats = passengerSelections.value
    .map(p => p.seatCode)
    .filter(s => s !== '')

  const currentPassenger = passengerSelections.value[index]
  if (!currentPassenger) return []

  return availableSeatsData.value.filter(seat =>
    !selectedSeats.includes(seat.seatCode) ||
    seat.seatCode === currentPassenger.seatCode
  )
}

const getPassengerName = (passengerId: string) => {
  const passenger = availablePassengers.value.find(p => p.id === passengerId)
  return passenger?.fullName || 'Unknown'
}

const getSeatShort = (seatCode: string) => {
  if (!seatCode) return ''
  return seatCode.substring(seatCode.lastIndexOf('-') + 1)
}

const validateStep = async (step: number): Promise<boolean> => {
  errorMessage.value = ''

  switch (step) {
    case 1:
      if (!selectedClassFlightId.value) {
        errorMessage.value = 'Please select a class'
        return false
      }
      return true

    case 2:
      if (!contactEmail.value || !contactEmail.value.includes('@')) {
        errorMessage.value = 'Please enter a valid email address'
        return false
      }
      if (!contactPhone.value || contactPhone.value.length < 10) {
        errorMessage.value = 'Please enter a valid phone number (10-15 digits)'
        return false
      }
      return true

    case 3:
      for (const passenger of passengerSelections.value) {
        if (!passenger.passengerId || !passenger.seatCode) {
          errorMessage.value = 'Please select passenger and seat for all travelers'
          return false
        }
      }
      return true

    default:
      return true
  }
}

const nextStep = async () => {
  if (!await validateStep(currentStep.value)) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  if (currentStep.value < 4) {
    currentStep.value++

    // Load seats when entering step 3
    if (currentStep.value === 3) {
      await loadAvailableSeats()
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    errorMessage.value = ''
  }
}

const submitBooking = async () => {
  try {
    submitting.value = true

    const bookingData: BookingRequest = {
      flightId: route.params.id as string,
      classFlightId: selectedClassFlightId.value!,
      contactEmail: contactEmail.value,
      contactPhone: contactPhone.value,
      passengerCount: passengerCount.value,
      passengers: passengerSelections.value.map(p => ({
        passengerId: p.passengerId,
        seatCode: p.seatCode
      }))
    }

    const response = await axios.post(`${API_BASE_URL}/bookings/create`, bookingData)
    bookingResult.value = response.data
    showSuccessModal.value = true

  } catch (error: any) {
    console.error('Error creating booking:', error)
    errorMessage.value = error.response?.data?.error || 'Failed to create booking'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    submitting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const goToBookings = () => {
  router.push('/bookings')
}

const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadFlightInfo(),
    loadAvailablePassengers()
  ])
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

/* Booking Card */
.booking-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.booking-header {
  text-align: center;
  margin-bottom: 2rem;
}

.booking-title {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.booking-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

/* Alert */
.alert-error {
  background: #fee;
  border: 1px solid #fcc;
  border-left: 4px solid #e53e3e;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  color: #c53030;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
  padding: 0 25px;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 50px;
  right: 50px;
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
}

.step {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-weight: 600;
  color: #9ca3af;
  transition: all 0.3s;
}

.step.active .step-circle {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.step.completed .step-circle {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.step.active .step-label {
  color: #667eea;
  font-weight: 600;
}

/* Flight Info Display */
.flight-info-display {
  background: #f9fafb;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.route-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.airport-info {
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

.flight-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.detail-box {
  background: white;
  padding: 1rem;
  border-radius: 8px;
}

.detail-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 600;
  color: #111827;
}

/* Step Content */
.step-content {
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Class Selection */
.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.class-card {
  border: 3px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.class-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.class-card.selected {
  border-color: #667eea;
  background: #f5f5ff;
}

.class-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.class-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.class-seats {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
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

.form-control:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

/* Passenger Counter */
.passenger-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
}

.counter-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #667eea;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: scale(1.1);
}

.counter-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.counter-value {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  min-width: 100px;
  text-align: center;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6b7280;
}

/* Passenger List */
.passenger-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.passenger-item {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background: #f9fafb;
}

.passenger-header {
  font-weight: 600;
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

/* Summary Section */
.summary-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  color: #6b7280;
}

.summary-value {
  font-weight: 600;
  color: #111827;
}

/* Total Price */
.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-top: 1rem;
}

.total-label {
  font-size: 1.2rem;
  font-weight: 600;
}

.total-amount {
  font-size: 2rem;
  font-weight: 700;
}

/* Navigation Buttons */
.nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #d1d5db;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.4);
}

/* Success Modal */
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

.modal-icon-success {
  font-size: 4rem;
  margin-bottom: 1rem;
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
  margin-bottom: 8px;
}

.modal-actions {
  display: flex;
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

.modal-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .booking-card {
    padding: 1.5rem;
  }

  .booking-title {
    font-size: 1.5rem;
  }

  .progress-steps {
    padding: 0 10px;
  }

  .progress-steps::before {
    left: 30px;
    right: 30px;
  }

  .step-circle {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .airport-code {
    font-size: 2rem;
  }

  .route-arrow {
    font-size: 1.5rem;
    padding: 0 1rem;
  }

  .flight-details-grid {
    grid-template-columns: 1fr;
  }

  .class-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .counter-value {
    font-size: 2.5rem;
  }

  .nav-buttons {
    flex-direction: column;
  }

  .modal-content {
    margin: 20px;
    padding: 20px;
  }
}
</style>
