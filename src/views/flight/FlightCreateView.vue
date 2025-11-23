<!-- eslint-disable @typescript-eslint/no-explicit-any -->
/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
  <div class="flight-create-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">✈️ Flight Management</div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/airplanes">Airplanes</router-link>
        <router-link to="/flights" class="active">Flights</router-link>
        <router-link to="/bookings">Flight Bookings</router-link>
      </div>
    </nav>

    <!-- Header -->
    <div class="header-section">
      <div class="breadcrumb">
        <router-link to="/flights">← All Flights</router-link>
        <span>/</span>
        <span>Create Flight</span>
      </div>
      <div class="header-icon">➕</div>
      <h1 class="header-title">Create New Flight</h1>
      <p class="header-subtitle">Add a new flight to the system with complete details</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      ❌ {{ errorMessage }}
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit">
      <!-- Basic Information -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">ℹ️</span>
          <div>
            <div class="section-title">Basic Information</div>
          </div>
          <div class="section-subtitle">Flight details and airline information</div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>
              <span class="icon">✈️</span>
              Airline <span class="required">*</span>
            </label>
            <select v-model="formData.airlineId" required @change="loadAirplanes">
              <option value="">Select Airline</option>
              <option v-for="airline in airlines" :key="airline.id" :value="airline.id">
                {{ airline.name }} ({{ airline.id }})
              </option>
            </select>
            <div class="form-help">Airline dropdown — data dari tabel Airline</div>
          </div>

          <div class="form-group">
            <label>
              <span class="icon">🛩️</span>
              Airplane <span class="required">*</span>
            </label>
            <select v-model="formData.airplaneId" required :disabled="!formData.airlineId" @change="updateAirplaneLimit">
              <option value="">Select Airplane</option>
              <option
                v-for="airplane in filteredAirplanes"
                :key="airplane.id"
                :value="airplane.id"
                :data-capacity="airplane.seatCapacity"
              >
                {{ airplane.id }} - {{ airplane.model }} ({{ airplane.seatCapacity }} seats)
              </option>
            </select>
            <div class="form-help">
              Hanya menampilkan pesawat aktif (isDeleted = FALSE) dan tidak digunakan di flight lain dengan
              waktu overlapping
            </div>
          </div>

          <div class="form-group">
            <label>
              <span class="icon">🏢</span>
              Terminal <span class="required">*</span>
            </label>
            <input v-model="formData.terminal" type="text" placeholder="e.g. Terminal 1" required />
          </div>

          <div class="form-group">
            <label>
              <span class="icon">🚪</span>
              Gate <span class="required">*</span>
            </label>
            <input v-model="formData.gate" type="text" placeholder="e.g. A12" required />
            <div class="form-help">Enter the gate number</div>
          </div>

          <div class="form-group">
            <label>
              <span class="icon">💼</span>
              Baggage Allowance (kg) <span class="required">*</span>
            </label>
            <input v-model.number="formData.baggageAllowance" type="number" placeholder="20" min="0" required />
          </div>

          <div class="form-group full-width">
            <label>
              <span class="icon">⭐</span>
              Facilities
            </label>
            <input v-model="formData.facilities" type="text" placeholder="e.g. WiFi, Meal, Entertainment" />
            <div class="form-help">Add flight optional (misalnya: meal, WiFi, entertainment)</div>
          </div>
        </div>
      </div>

      <!-- Route Information -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">🗺️</span>
          <div>
            <div class="section-title">Route Information</div>
          </div>
          <div class="section-subtitle">Origin, destination, and schedule details</div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>
              <span class="icon">🛫</span>
              Origin Airport <span class="required">*</span>
            </label>
            <select v-model="formData.originAirportCode" required>
              <option value="">Select Origin Airport</option>
              <option v-for="airport in airports" :key="airport.iataCode" :value="airport.iataCode">
                {{ airport.iataCode }} - {{ airport.name }} ({{ airport.city }})
              </option>
            </select>
            <div class="form-help">Origin Airport dropdown — data bandara asal</div>
          </div>

          <div class="form-group">
            <label>
              <span class="icon">🛬</span>
              Destination Airport <span class="required">*</span>
            </label>
            <select v-model="formData.destinationAirportCode" required>
              <option value="">Select Destination Airport</option>
              <option v-for="airport in airports" :key="airport.iataCode" :value="airport.iataCode">
                {{ airport.iataCode }} - {{ airport.name }} ({{ airport.city }})
              </option>
            </select>
            <div class="form-help">Destination Airport dropdown — data bandara tujuan</div>
          </div>

          <div class="form-group">
            <label>
              <span class="icon">🕐</span>
              Departure Time <span class="required">*</span>
            </label>
            <input v-model="formData.departureTime" type="datetime-local" required />
          </div>

          <div class="form-group">
            <label>
              <span class="icon">🕐</span>
              Arrival Time <span class="required">*</span>
            </label>
            <input v-model="formData.arrivalTime" type="datetime-local" required />
          </div>
        </div>
      </div>

      <!-- Class Configuration -->
      <div class="form-section">
        <div class="section-header">
          <span class="section-icon">🪑</span>
          <div>
            <div class="section-title">Class Configuration</div>
          </div>
          <div class="section-subtitle">Configure seat classes and pricing</div>
        </div>

        <button type="button" class="btn btn-add" @click="addClass">➕ Add Class</button>

        <div class="class-list">
          <div v-for="(classItem, index) in formData.classFlights" :key="index" class="class-item">
            <div class="class-header">
              <div class="class-title">Class {{ index + 1 }}</div>
              <button type="button" class="btn-remove-class" @click="removeClass(index)">🗑️</button>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>
                  <span class="icon">🏷️</span>
                  Class Type <span class="required">*</span>
                </label>
                <select v-model.number="classItem.classType" required @change="updateTotalCapacity">
                  <option value="">Select Class Type</option>
                  <option :value="1">Economy</option>
                  <option :value="2">Business</option>
                  <option :value="3">First</option>
                </select>
              </div>

              <div class="form-group">
                <label>
                  <span class="icon">🪑</span>
                  Seat Capacity <span class="required">*</span>
                </label>
                <input
                  v-model.number="classItem.seatCapacity"
                  type="number"
                  placeholder="150"
                  min="1"
                  required
                  @input="updateTotalCapacity"
                />
              </div>

              <div class="form-group">
                <label>
                  <span class="icon">💰</span>
                  Price (IDR) <span class="required">*</span>
                </label>
                <input
                  v-model.number="classItem.price"
                  type="number"
                  placeholder="500000"
                  min="0"
                  required
                  @input="updateTotalCapacity"
                />
              </div>
            </div>

            <div class="class-summary">
              <div class="summary-item">
                <div class="summary-label">TYPE</div>
                <div class="summary-value">{{ getClassTypeName(classItem.classType) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">CAPACITY</div>
                <div class="summary-value">{{ classItem.seatCapacity || 0 }} seats</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">PRICE</div>
                <div class="summary-value">
                  Rp {{ classItem.price ? classItem.price.toLocaleString('id-ID') : 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="total-capacity">
          <div class="capacity-info">
            <div class="capacity-item">
              <strong>Total Capacity: </strong>
              <span :style="{ color: totalCapacityExceeded ? '#c62828' : '#667eea' }">
                {{ totalCapacity }} seats
              </span>
            </div>
            <div class="capacity-item">
              <strong>Airplane Limit: </strong>
              <span>{{ airplaneLimit }} seats</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <router-link to="/flights" class="btn btn-secondary">✖️ Cancel</router-link>
        <button type="submit" class="btn btn-primary" :disabled="loading || totalCapacityExceeded">
          {{ loading ? '⏳ Creating Flight...' : '✈️ Create Flight' }}
        </button>
      </div>
    </form>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flightStore'
import { useAirlineStore } from '@/stores/airline/airlineStore'
import { useAirplaneStore } from '@/stores/airplane/airplaneStore'
import type { FlightRequest, ClassFlightRequest } from '@/interfaces/flight.interface'
import type { Airline } from '@/interfaces/airline.interface'
import type { Airplane } from '@/interfaces/airplane.interface'
import axios from 'axios'

const router = useRouter()
const flightStore = useFlightStore()
const airlineStore = useAirlineStore()
const airplaneStore = useAirplaneStore()

// State
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const airlines = ref<Airline[]>([])
const airplanes = ref<Airplane[]>([])
const airports = ref<any[]>([])

const formData = ref<FlightRequest>({
  airlineId: '',
  airplaneId: '',
  originAirportCode: '',
  destinationAirportCode: '',
  departureTime: '',
  arrivalTime: '',
  terminal: '',
  gate: '',
  baggageAllowance: 20,
  facilities: '',
  classFlights: []
})

// Computed
const filteredAirplanes = computed(() => {
  return airplanes.value.filter(
    (airplane) => airplane.airlineId === formData.value.airlineId && !airplane.isDeleted
  )
})

const totalCapacity = computed(() => {
  return formData.value.classFlights.reduce((sum, cf) => sum + (cf.seatCapacity || 0), 0)
})

const airplaneLimit = computed(() => {
  const selectedAirplane = airplanes.value.find((a) => a.id === formData.value.airplaneId)
  return selectedAirplane?.seatCapacity || '-'
})

const totalCapacityExceeded = computed(() => {
  if (airplaneLimit.value === '-') return false
  return totalCapacity.value > Number(airplaneLimit.value)
})

// Methods
const loadAirlines = async () => {
  try {
    await airlineStore.fetchAirlines()
    airlines.value = airlineStore.airlines
  } catch (error) {
    console.error('Error loading airlines:', error)
    showError('Failed to load airlines')
  }
}

const loadAirplanes = async () => {
  formData.value.airplaneId = '' // Reset airplane selection
  try {
    await airplaneStore.fetchAirplanes()
    airplanes.value = airplaneStore.airplanes
  } catch (error) {
    console.error('Error loading airplanes:', error)
    showError('Failed to load airplanes')
  }
}

const loadAirports = async () => {
  try {
    const API_BASE_URL = 'http://localhost:8081/api'
    const response = await axios.get(`${API_BASE_URL}/airports`)
    airports.value = response.data
  } catch (error) {
    console.error('Error loading airports:', error)
    showError('Failed to load airports')
  }
}

const addClass = () => {
  const newClass: ClassFlightRequest = {
    classType: 1,
    seatCapacity: 0,
    price: 0
  }
  formData.value.classFlights.push(newClass)
}

const removeClass = (index: number) => {
  formData.value.classFlights.splice(index, 1)
  updateTotalCapacity()
}

const updateTotalCapacity = () => {
  // Trigger reactivity (computed will auto-update)
}

const updateAirplaneLimit = () => {
  updateTotalCapacity()
}

const getClassTypeName = (classType: number | string): string => {
  const type = Number(classType)
  const classMap: Record<number, string> = {
    1: 'Economy',
    2: 'Business',
    3: 'First'
  }
  return classMap[type] || '-'
}

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = null

  try {
    // Validate
    if (formData.value.classFlights.length === 0) {
      throw new Error('Please add at least one class configuration')
    }

    if (totalCapacityExceeded.value) {
      throw new Error('Total seat capacity exceeds airplane limit')
    }

    if (formData.value.originAirportCode === formData.value.destinationAirportCode) {
      throw new Error('Origin and destination airports cannot be the same')
    }

    // Submit
    const result = await flightStore.createFlight(formData.value)

    alert(`✅ Flight ${result.id} created successfully!`)
    router.push('/flights')
  } catch (error: any) {
    console.error('Error creating flight:', error)
    showError(error.response?.data?.message || error.message || 'Failed to create flight')
  } finally {
    loading.value = false
  }
}

const showError = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = null
  }, 5000)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadAirlines(), loadAirports()])
  // Add first class by default
  addClass()
})
</script>

<style scoped>
/* Copy semua style dari HTML template */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.flight-create-container {
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

.nav-links a:hover,
.nav-links a.active {
  background: rgba(255, 255, 255, 0.2);
}

/* Header */
.header-section {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  opacity: 0.9;
}

.breadcrumb a {
  color: white;
  text-decoration: none;
}

.header-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 1rem;
  opacity: 0.95;
}

/* Form Sections */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.section-icon {
  font-size: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.section-subtitle {
  font-size: 0.85rem;
  color: #666;
  margin-left: auto;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-group label .required {
  color: #e74c3c;
}

.form-group label .icon {
  font-size: 1rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-help {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

/* Class Configuration */
.class-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.class-item {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.class-title {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.btn-remove-class {
  background: #ffebee;
  color: #c62828;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.btn-remove-class:hover {
  background: #c62828;
  color: white;
}

.class-summary {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  font-size: 0.85rem;
}

.summary-item {
  text-align: center;
}

.summary-label {
  color: #666;
  margin-bottom: 3px;
}

.summary-value {
  font-weight: 700;
  color: #667eea;
  font-size: 1rem;
}

.total-capacity {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.capacity-info {
  display: flex;
  gap: 30px;
}

.capacity-item span {
  font-weight: 600;
  color: #667eea;
  font-size: 1.1rem;
}

/* Buttons */
.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-add {
  background: #e8f5e9;
  color: #2e7d32;
  margin-bottom: 15px;
}

.btn-add:hover {
  background: #2e7d32;
  color: white;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

/* Error Message */
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* Loading */
.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
