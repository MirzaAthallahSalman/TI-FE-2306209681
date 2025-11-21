<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="flight-list-container">
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

    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-icon">✈️</div>
          <div class="header-title">All Flights</div>
        </div>
        <router-link to="/flights/create" class="btn-create">➕ Create Flight</router-link>
      </div>

      <!-- Trip Type Tabs -->
      <div class="trip-tabs">
        <button
          :class="['trip-tab', { active: currentTripType === 'one-way' }]"
          @click="switchTripType('one-way')"
        >
          🛫 One Way
        </button>
        <button
          :class="['trip-tab', { active: currentTripType === 'round-trip' }]"
          @click="switchTripType('round-trip')"
        >
          🔄 Round Trip
        </button>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-grid">
          <div class="filter-group">
            <label>🛫 Origin</label>
            <input v-model="filters.origin" type="text" placeholder="Airport code (e.g. CGK)" />
          </div>

          <div class="filter-group">
            <label>🛬 Destination</label>
            <input v-model="filters.destination" type="text" placeholder="Airport code (e.g. SIN)" />
          </div>

          <div class="filter-group">
            <label>✈️ Airline</label>
            <select v-model="filters.airline">
              <option value="">All Airlines</option>
              <option v-for="airline in airlines" :key="airline.id" :value="airline.id">
                {{ airline.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>📊 Status</label>
            <select v-model="filters.status">
              <option value="">All Statuses</option>
              <option value="1">Scheduled</option>
              <option value="2">In Flight</option>
              <option value="3">Finished</option>
              <option value="4">Delayed</option>
              <option value="5">Cancelled</option>
            </select>
          </div>

          <div class="filter-group">
            <label>🔍 Search</label>
            <input v-model="filters.search" type="text" placeholder="Flight number or airline" />
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn-reset" @click="applyFilters">🔍 Search</button>
          <button class="btn-reset" @click="resetFilters">🔄 Reset</button>
        </div>
      </div>

      <!-- Round Trip Selection Banner -->
      <div v-if="showRoundTripBanner" class="round-trip-banner show">
        <div class="banner-text">
          <span>✅ Proceed to Booking</span>
          <div class="banner-flights">
            <span>🛫 Departure: <strong>{{ selectedDeparture }}</strong></span>
            <span>→</span>
            <span>🛬 Return: <strong>{{ selectedReturn }}</strong></span>
          </div>
        </div>
        <button class="btn-book" @click="proceedToBooking">📋 Book Flight</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading flights...</p>
      </div>

      <!-- Flights Container -->
      <div v-else-if="displayedFlights.length > 0" class="flights-container">
        <div
          v-for="flight in displayedFlights"
          :key="flight.id"
          :class="['flight-card', { selected: isFlightSelected(flight.id) }]"
        >
          <!-- Flight Header -->
          <div class="flight-header">
            <div class="flight-number">✈️ {{ flight.id }}</div>
            <div :class="['flight-status', getStatusClass(flight.status)]">
              {{ flight.statusText }}
            </div>
          </div>

          <!-- Flight Route -->
          <div class="flight-route">
            <div class="airport">
              <div class="airport-code">{{ flight.originAirportCode }}</div>
              <div class="airport-name">{{ flight.originAirportName }}</div>
              <div class="airport-city">{{ flight.originCity }}</div>
            </div>

            <div class="flight-duration">
              <div class="duration-time">{{ calculateDuration(flight.departureTime, flight.arrivalTime) }}</div>
              <div class="duration-line">
                <span class="duration-icon">✈️</span>
              </div>
            </div>

            <div class="airport">
              <div class="airport-code">{{ flight.destinationAirportCode }}</div>
              <div class="airport-name">{{ flight.destinationAirportName }}</div>
              <div class="airport-city">{{ flight.destinationCity }}</div>
            </div>
          </div>

          <!-- Flight Details -->
          <div class="flight-details">
            <div class="detail-item">
              <span class="detail-icon">🛫</span>
              <span class="detail-value">{{ formatDateTime(flight.departureTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">🛬</span>
              <span class="detail-value">{{ formatDateTime(flight.arrivalTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">✈️</span>
              <span class="detail-label">Aircraft:</span>
              <span class="detail-value">{{ flight.airplaneModel }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">🏢</span>
              <span class="detail-label">Terminal:</span>
              <span class="detail-value">{{ flight.terminal || '-' }}, Gate {{ flight.gate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">💼</span>
              <span class="detail-label">Baggage:</span>
              <span class="detail-value">{{ flight.baggageAllowance || 0 }} kg</span>
            </div>
          </div>

          <!-- Facilities Warning -->
          <div v-if="flight.facilities" class="flight-warning">⚠️ {{ flight.facilities }}</div>

          <!-- Flight Classes -->
          <div class="flight-classes">
            <div class="classes-title">AVAILABLE CLASSES</div>
            <div class="classes-grid">
              <div v-for="cf in flight.classFlights" :key="cf.id" class="class-item">
                <div class="class-name">{{ cf.className }}</div>
                <div class="class-info">
                  <div class="class-seats">{{ cf.availableSeats }}/{{ cf.seatCapacity }} seats</div>
                  <div class="class-price">Rp {{ cf.price.toLocaleString('id-ID') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Flight Actions -->
          <div class="flight-actions">
            <button class="btn btn-detail" @click="viewDetail(flight.id)">ℹ️ Detail</button>
            <button class="btn btn-update" @click="updateFlight(flight.id)">✏️ Update</button>
            <button class="btn btn-cancel" @click="showCancelModal(flight)">✖️ Cancel</button>

            <!-- One-way booking -->
            <button v-if="currentTripType === 'one-way'" class="btn btn-book" @click="bookFlight(flight.id)">
              📋 Book Flight
            </button>

            <!-- Round-trip selection -->
            <button
              v-else
              class="btn btn-select"
              @click="selectFlight(flight.id, flight.originAirportCode, flight.destinationAirportCode)"
            >
              ✅ Select {{ selectedDeparture ? 'Return' : 'Departure' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">✈️</div>
        <h3 class="empty-title">No Flights Found</h3>
        <p class="empty-text">We couldn't find any flights matching your criteria</p>
        <button class="btn-reset" @click="resetFilters">🔄 Clear Filters</button>
      </div>
    </div>

    <!-- Cancel Modal -->
    <div v-if="cancelModalVisible" class="modal-overlay" @click.self="closeCancelModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon">⚠️</div>
          <h2 class="modal-title">Confirm Flight Cancellation</h2>
        </div>
        <div class="modal-body">
          <p class="modal-text">
            Are you sure you want to cancel flight <strong>{{ flightToCancel?.id }}</strong>?
          </p>

          <div class="flight-info">
            <div>📍 {{ flightToCancel?.originAirportCode }} → {{ flightToCancel?.destinationAirportCode }}</div>
            <div>📊 Status: {{ flightToCancel?.statusText }}</div>
            <div>✈️ Airline: {{ flightToCancel?.airlineName || 'Unknown Airlines' }}</div>
            <div>📅 {{ formatDateTime(flightToCancel?.departureTime) }}</div>
          </div>

          <div class="warning-box">
            <span>⚠️</span>
            <div>
              <strong>
                This action will mark the flight as cancelled and prevent new bookings.
              </strong>
              Active bookings may need to be handled separately.
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="closeCancelModal">Cancel</button>
          <button class="modal-btn modal-btn-confirm" @click="confirmCancelFlight">
            ❌ Cancel Flight
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flightStore'
import { useAirlineStore } from '@/stores/airline/airlineStore'
import type { FlightResponse } from '@/interfaces/flight.interface'
import type { Airline } from '@/interfaces/airline.interface'

const router = useRouter()
const flightStore = useFlightStore()
const airlineStore = useAirlineStore()

// State
const loading = ref(true)
const airlines = ref<Airline[]>([])
const allFlights = ref<FlightResponse[]>([])
const displayedFlights = ref<FlightResponse[]>([])

const currentTripType = ref<'one-way' | 'round-trip'>('one-way')
const selectedDeparture = ref<string | null>(null)
const selectedReturn = ref<string | null>(null)

const filters = ref({
  origin: '',
  destination: '',
  airline: '',
  status: '',
  search: ''
})

const cancelModalVisible = ref(false)
const flightToCancel = ref<FlightResponse | null>(null)

// Computed
const showRoundTripBanner = computed(() => {
  return currentTripType.value === 'round-trip' && selectedDeparture.value && selectedReturn.value
})

// Methods
const loadAirlines = async () => {
  try {
    await airlineStore.fetchAirlines()
    airlines.value = airlineStore.airlines
  } catch (error) {
    console.error('Error loading airlines:', error)
  }
}

const loadFlights = async () => {
  loading.value = true
  try {
    await flightStore.fetchFlights()
    allFlights.value = flightStore.flights
    displayedFlights.value = allFlights.value
  } catch (error) {
    console.error('Error loading flights:', error)
  } finally {
    loading.value = false
  }
}

const switchTripType = (type: 'one-way' | 'round-trip') => {
  currentTripType.value = type
  selectedDeparture.value = null
  selectedReturn.value = null
  displayedFlights.value = allFlights.value
}

const selectFlight = (flightId: string, origin: string, destination: string) => {
  if (!selectedDeparture.value) {
    // Select as departure
    selectedDeparture.value = flightId
    alert('✅ Departure flight selected! Now select your return flight.')

    // Filter flights for return (destination → origin)
    const returnFlights = allFlights.value.filter(
      (f) => f.originAirportCode === destination && f.destinationAirportCode === origin && f.status === 1
    )

    displayedFlights.value = returnFlights
  } else if (!selectedReturn.value && flightId !== selectedDeparture.value) {
    // Select as return
    selectedReturn.value = flightId
  } else {
    alert('⚠️ You have already selected both departure and return flights!')
  }
}

const proceedToBooking = () => {
  if (selectedDeparture.value && selectedReturn.value) {
    router.push(`/bookings/create/${selectedDeparture.value}?returnFlightId=${selectedReturn.value}`)
  } else {
    alert('⚠️ Please select both departure and return flights!')
  }
}

const applyFilters = async () => {
  try {
    await flightStore.searchFlights({
      origin: filters.value.origin.toUpperCase() || undefined,
      destination: filters.value.destination.toUpperCase() || undefined,
      airline: filters.value.airline || undefined,
      status: filters.value.status ? Number(filters.value.status) : undefined,
      search: filters.value.search || undefined
    })
    displayedFlights.value = flightStore.flights
  } catch (error) {
    console.error('Error applying filters:', error)
  }
}

const resetFilters = () => {
  filters.value = {
    origin: '',
    destination: '',
    airline: '',
    status: '',
    search: ''
  }
  displayedFlights.value = allFlights.value
}

const isFlightSelected = (flightId: string): boolean => {
  return flightId === selectedDeparture.value || flightId === selectedReturn.value
}

const viewDetail = (id: string) => {
  router.push(`/flights/${id}`)
}

const updateFlight = (id: string) => {
  router.push(`/flights/${id}/update`)
}

const bookFlight = (id: string) => {
  router.push(`/bookings/create/${id}`)
}

const showCancelModal = (flight: FlightResponse) => {
  // Check if flight can be cancelled
  if (flight.status === 3) {
    alert('Cannot cancel a finished flight')
    return
  }
  if (flight.status === 5) {
    alert('Flight is already cancelled')
    return
  }

  flightToCancel.value = flight
  cancelModalVisible.value = true
}

const closeCancelModal = () => {
  cancelModalVisible.value = false
  flightToCancel.value = null
}

const confirmCancelFlight = async () => {
  if (!flightToCancel.value) return

  try {
    await flightStore.cancelFlight(flightToCancel.value.id)
    alert(`✅ Flight ${flightToCancel.value.id} cancelled successfully!`)
    closeCancelModal()
    await loadFlights()
  } catch (error: any) {
    console.error('Error cancelling flight:', error)
    alert('❌ Failed to cancel flight: ' + (error.response?.data?.error || error.message))
    closeCancelModal()
  }
}

const calculateDuration = (departure: string, arrival: string): string => {
  const start = new Date(departure)
  const end = new Date(arrival)
  const diff = end.getTime() - start.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

const formatDateTime = (datetime: string): string => {
  if (!datetime) return '-'
  const date = new Date(datetime)
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status: number): string => {
  const statusMap: Record<number, string> = {
    1: 'status-scheduled',
    2: 'status-in-flight',
    3: 'status-finished',
    4: 'status-delayed',
    5: 'status-cancelled'
  }
  return statusMap[status] || ''
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadAirlines(), loadFlights()])
})
</script>

<style scoped>
/* Copy all styles from HTML template */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.flight-list-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
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

.btn-create {
  background: white;
  color: #667eea;
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
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
}

/* Trip Type Tabs */
.trip-tabs {
  background: white;
  border-radius: 12px 12px 0 0;
  padding: 0;
  display: flex;
  overflow: hidden;
}

.trip-tab {
  flex: 1;
  padding: 15px 25px;
  border: none;
  background: white;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.trip-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f5f5ff;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  display: flex;
  align-items: center;
  gap: 5px;
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
  margin-top: 15px;
}

.btn-reset {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-reset:hover {
  background: #f5f5f5;
}

/* Round Trip Selection Banner */
.round-trip-banner {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 15px 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.banner-text {
  display: flex;
  align-items: center;
  gap: 15px;
}

.banner-flights {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

/* Flight Cards */
.flights-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flight-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
}

.flight-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.flight-card.selected {
  border: 3px solid #11998e;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.flight-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 8px;
}

.flight-status {
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-scheduled {
  background: #e3f2fd;
  color: #1976d2;
}

.status-in-flight {
  background: #fff3e0;
  color: #f57c00;
}

.status-finished {
  background: #e8f5e9;
  color: #388e3c;
}

.status-delayed {
  background: #ffebee;
  color: #d32f2f;
}

.status-cancelled {
  background: #f3e5f5;
  color: #7b1fa2;
}

.flight-route {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.airport {
  text-align: center;
}

.airport-code {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.airport-name {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.airport-city {
  font-size: 0.8rem;
  color: #999;
}

.flight-duration {
  text-align: center;
  padding: 0 20px;
}

.duration-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  position: relative;
  margin: 10px 0;
}

.duration-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 5px;
  border-radius: 50%;
}

.duration-time {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
}

.flight-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 12px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.detail-icon {
  color: #667eea;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

.flight-classes {
  margin-bottom: 20px;
}

.classes-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.class-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.class-item:hover {
  border-color: #667eea;
}

.class-name {
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.class-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.class-seats {
  font-size: 0.85rem;
  color: #666;
}

.class-price {
  font-weight: 700;
  color: #667eea;
  font-size: 1rem;
}

.flight-warning {
  background: #fff3cd;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #856404;
  margin-bottom: 15px;
}

.flight-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.btn-detail {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-detail:hover {
  background: #1976d2;
  color: white;
}

.btn-update {
  background: #fff3e0;
  color: #f57c00;
}

.btn-update:hover {
  background: #f57c00;
  color: white;
}

.btn-cancel {
  background: #ffebee;
  color: #c62828;
}

.btn-cancel:hover {
  background: #c62828;
  color: white;
}

.btn-book,
.btn-select {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-book:hover,
.btn-select:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
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
  margin-bottom: 20px;
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 16px;
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

/* Cancel Modal (sama seperti FlightDetailView) */
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

.flight-info {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  font-size: 0.9rem;
}

.flight-info div {
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

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
  }

  .header-section {
    flex-direction: column;
    gap: 15px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .flight-route {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .flight-details {
    grid-template-columns: 1fr;
  }

  .classes-grid {
    grid-template-columns: 1fr;
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
