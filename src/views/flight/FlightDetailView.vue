<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="flight-detail-container">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand">
          <i class="bi bi-airplane-fill"></i> Flight Management
        </router-link>
        <div class="navbar-nav ms-auto">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/airplanes" class="nav-link">Airplanes</router-link>
          <router-link to="/flights" class="nav-link active">Flights</router-link>
        </div>
      </div>
    </nav>

    <!-- Main Container -->
    <div class="container main-container">
      <!-- Loading Spinner -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border text-light" style="width: 3rem; height: 3rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <h4>Error Loading Flight</h4>
        <p>{{ error }}</p>
        <router-link to="/flights" class="btn btn-primary">Back to Flights</router-link>
      </div>

      <!-- Flight Content -->
      <div v-else-if="flight">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-3">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-white">Home</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link to="/flights" class="text-white">All Flights</router-link>
            </li>
            <li class="breadcrumb-item active text-white" aria-current="page">Flight Detail</li>
          </ol>
        </nav>

        <!-- Flight Header -->
        <div class="flight-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="flight-number">{{ flight.flightNumber }}</div>
              <div class="airline-info">{{ flight.airlineName }} ({{ flight.airlineCountry }})</div>
            </div>
            <div>
              <span :class="['status-badge', getStatusClass(flight.status)]">
                {{ flight.statusText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Route Information -->
        <div class="route-section">
          <h4 class="mb-4"><i class="bi bi-geo-alt"></i> Route Information</h4>
          <div class="row align-items-center">
            <div class="col-md-5">
              <div class="airport-box">
                <div class="airport-code">{{ flight.originAirportCode }}</div>
                <div class="airport-name">{{ flight.originAirportName }}</div>
                <div class="text-muted">{{ flight.originCity }}, {{ flight.originCountry }}</div>
                <div class="mt-3">
                  <i class="bi bi-calendar3"></i>
                  <strong>Departure:</strong>
                  <div>{{ formatDateTime(flight.departureTime) }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <div class="flight-arrow">
                <div class="flight-duration">{{ flightDuration }}</div>
                <i class="bi bi-airplane" style="font-size: 2rem; color: var(--primary-color)"></i>
              </div>
            </div>
            <div class="col-md-5">
              <div class="airport-box">
                <div class="airport-code">{{ flight.destinationAirportCode }}</div>
                <div class="airport-name">{{ flight.destinationAirportName }}</div>
                <div class="text-muted">
                  {{ flight.destinationCity }}, {{ flight.destinationCountry }}
                </div>
                <div class="mt-3">
                  <i class="bi bi-calendar3"></i>
                  <strong>Arrival:</strong>
                  <div>{{ formatDateTime(flight.arrivalTime) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aircraft Information -->
        <div class="info-card" v-if="flight.aircraftInfo">
          <h4 class="mb-4"><i class="bi bi-airplane"></i> Aircraft Information</h4>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-tag"></i> Aircraft ID:</span>
            <span class="info-value">{{ flight.aircraftInfo.aircraftId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-star"></i> Model:</span>
            <span class="info-value">{{ flight.aircraftInfo.model }}</span>
          </div>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-people"></i> Seat Capacity:</span>
            <span class="info-value">{{ flight.aircraftInfo.seatCapacity }} seats</span>
          </div>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-calendar-check"></i> Manufacture Year:</span>
            <span class="info-value">{{ flight.aircraftInfo.manufactureYear }}</span>
          </div>
        </div>

        <!-- Flight Details -->
        <div class="info-card">
          <h4 class="mb-4"><i class="bi bi-info-circle"></i> Flight Details</h4>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-building"></i> Terminal:</span>
            <span class="info-value">{{ flight.terminal || 'N/A' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-door-open"></i> Gate:</span>
            <span class="info-value">{{ flight.gate || 'N/A' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-luggage"></i> Baggage:</span>
            <span class="info-value">
              {{ flight.baggageAllowance ? `${flight.baggageAllowance} kg` : 'N/A' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label"><i class="bi bi-star"></i> Facilities:</span>
            <span class="info-value">{{ flight.facilities || 'N/A' }}</span>
          </div>
        </div>

        <!-- Flight Classes -->
        <h4 class="mb-4 text-white"><i class="bi bi-columns-gap"></i> Flight Classes</h4>
        <p class="text-white mb-4">Available seat classes and pricing information</p>

        <div v-if="!flight.classFlights || flight.classFlights.length === 0">
          <div class="alert alert-warning">
            <h5>No Class Information Available</h5>
            <p>This flight doesn't have any class configuration yet.</p>
          </div>
        </div>

        <div v-else>
          <div v-for="classFlight in flight.classFlights" :key="classFlight.id" class="class-card">
            <!-- Class Header -->
            <div class="class-header">
              <h3 class="class-name">{{ classFlight.className }}</h3>
              <div class="class-price">Rp {{ formatPrice(classFlight.price) }}</div>
            </div>

            <!-- Seat Stats -->
            <div class="seat-stats">
              <div class="stat-box">
                <div class="stat-label">TOTAL SEATS</div>
                <div class="stat-value">{{ classFlight.totalSeats }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">AVAILABLE</div>
                <div class="stat-value" style="color: var(--success-color)">
                  {{ classFlight.availableSeats }}
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-label">BOOKED</div>
                <div class="stat-value" style="color: var(--danger-color)">
                  {{ classFlight.bookedSeats }}
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-label">OCCUPANCY</div>
                <div class="stat-value">{{ classFlight.occupancyPercentage.toFixed(0) }}%</div>
              </div>
            </div>

            <!-- Occupancy Bar -->
            <div class="occupancy-bar">
              <div class="occupancy-fill" :style="{ width: classFlight.occupancyPercentage + '%' }"></div>
            </div>

            <!-- Seat Map Toggle -->
            <div class="seat-map-toggle">
              <button
                class="btn btn-outline-primary seat-map-toggle-btn"
                @click="toggleSeatMap(classFlight.id)"
              >
                <i :class="showSeatMap[classFlight.id] ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                {{ showSeatMap[classFlight.id] ? 'Hide Seat Map' : 'Show Seat Map' }}
              </button>
            </div>

            <!-- Seat Map Container -->
            <div v-show="showSeatMap[classFlight.id]" class="seat-map-container show">
              <div class="seat-legend">
                <div class="legend-item">
                  <div class="legend-box legend-available"></div>
                  <span>Available</span>
                </div>
                <div class="legend-item">
                  <div class="legend-box legend-booked"></div>
                  <span>Booked</span>
                </div>
              </div>
              <div class="seat-grid">
                <div
                  v-for="seat in classFlight.seatMap"
                  :key="seat.seatCode"
                  :class="['seat', seat.isAvailable ? 'seat-available' : 'seat-booked']"
                  :title="seat.seatCode"
                >
                  {{ getSeatLabel(seat.seatCode) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-custom btn-update" @click="goToUpdateFlight">
            <i class="bi bi-pencil-square"></i> Update Flight
          </button>
          <button class="btn btn-custom btn-book" @click="bookThisFlight">
            <i class="bi bi-ticket-perforated"></i> Book Flight
          </button>
          <button class="btn btn-custom btn-cancel" @click="showCancelModal">
            <i class="bi bi-x-circle"></i> Cancel Flight
          </button>
        </div>
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
            Are you sure you want to cancel flight <strong>{{ flight?.flightNumber }}</strong>?
          </p>

          <div class="flight-info">
            <div>📍 {{ flight?.originAirportCode }} → {{ flight?.destinationAirportCode }}</div>
            <div>📊 Status: {{ flight?.statusText }}</div>
            <div>✈️ Airline: {{ flight?.airlineName || 'Unknown Airlines' }}</div>
            <!-- FIX: Add nullish coalescing -->
            <div>📅 {{ formatDateTime(flight?.departureTime ?? '') }}</div>
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
import { useRoute, useRouter } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flightStore'
import type { FlightDetailResponse } from '@/interfaces/flight.interface'

const route = useRoute()
const router = useRouter()
const flightStore = useFlightStore()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const flight = ref<FlightDetailResponse | null>(null)
const showSeatMap = ref<Record<number, boolean>>({})
const cancelModalVisible = ref(false)

// Computed
const flightDuration = computed(() => {
  if (!flight.value) return ''
  return calculateDuration(flight.value.departureTime, flight.value.arrivalTime)
})

// Methods
const loadFlightDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const flightId = route.params.id as string
    const data = await flightStore.getFlightDetail(flightId)
    flight.value = data
  } catch (err: any) {
    console.error('Error loading flight:', err)
    error.value = err.response?.data?.message || err.message || 'Flight not found'
  } finally {
    loading.value = false
  }
}

const toggleSeatMap = (classFlightId: number) => {
  showSeatMap.value[classFlightId] = !showSeatMap.value[classFlightId]
}

const getSeatLabel = (seatCode: string | undefined): string => {
  if (!seatCode) return '-'
  const parts = seatCode.split('-')
  return parts[parts.length - 1] || '-'
}

const getStatusClass = (status: number): string => {
  const statusMap: Record<number, string> = {
    1: 'status-scheduled',
    2: 'status-in-flight',
    3: 'status-finished',
    4: 'status-delayed',
    5: 'status-cancelled'
  }
  return statusMap[status] || 'status-scheduled'
}

const formatDateTime = (dateTimeString: string | undefined): string => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return date.toLocaleDateString('en-GB', options)
}

const calculateDuration = (departure: string | undefined, arrival: string | undefined): string => {
  if (!departure || !arrival) return '-'
  const start = new Date(departure)
  const end = new Date(arrival)
  const diff = end.getTime() - start.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const goToUpdateFlight = () => {
  router.push(`/flights/${route.params.id}/update`)
}

const bookThisFlight = () => {
  router.push(`/bookings/create/${route.params.id}`)
}

const showCancelModal = () => {
  if (!flight.value) {
    alert('Flight data not available!')
    return
  }

  // Check if flight can be cancelled
  if (flight.value.status === 3) {
    alert('Cannot cancel a finished flight')
    return
  }
  if (flight.value.status === 5) {
    alert('Flight is already cancelled')
    return
  }

  cancelModalVisible.value = true
}

const closeCancelModal = () => {
  cancelModalVisible.value = false
}

const confirmCancelFlight = async () => {
  try {
    const flightId = route.params.id as string
    await flightStore.cancelFlight(flightId)

    alert(`✅ Flight ${flightId} cancelled successfully!`)
    closeCancelModal()
    router.push('/flights')
  } catch (err: any) {
    console.error('Error cancelling flight:', err)
    alert('❌ Failed to cancel flight: ' + (err.response?.data?.error || err.message))
    closeCancelModal()
  }
}

// Lifecycle
onMounted(() => {
  loadFlightDetail()
})
</script>

<style scoped>
@import 'bootstrap-icons/font/bootstrap-icons.css';

:root {
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
}

.flight-detail-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  color: #333;
  font-weight: 600;
  text-decoration: none;
}

.navbar-brand:hover {
  color: var(--primary-color);
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
}

.main-container {
  padding: 2rem 0;
}

.flight-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.flight-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.airline-info {
  color: #6b7280;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-scheduled {
  background: #dbeafe;
  color: #1e40af;
}

.status-in-flight {
  background: #fef3c7;
  color: #92400e;
}

.status-finished {
  background: #d1fae5;
  color: #065f46;
}

.status-delayed {
  background: #fed7aa;
  color: #c2410c;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.route-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.airport-box {
  text-align: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.airport-code {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.airport-name {
  font-size: 1rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.flight-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.flight-duration {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #111827;
  font-weight: 600;
}

.class-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.class-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.class-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
}

.class-price {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--success-color);
}

.seat-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-box {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
}

.occupancy-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.occupancy-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), var(--warning-color));
  transition: width 0.5s ease;
}

.seat-map-toggle {
  text-align: center;
  margin: 1.5rem 0;
}

.seat-map-container {
  padding: 2rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-top: 1rem;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-box {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 2px solid #d1d5db;
}

.legend-available {
  background: var(--success-color);
}

.legend-booked {
  background: var(--danger-color);
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.75rem;
  max-width: 800px;
  margin: 0 auto;
}

.seat {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seat-available {
  background: var(--success-color);
  color: white;
}

.seat-available:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.seat-booked {
  background: var(--danger-color);
  color: white;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-custom {
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-update {
  background: var(--primary-color);
  color: white;
}

.btn-update:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-book {
  background: var(--success-color);
  color: white;
}

.btn-book:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-cancel {
  background: var(--danger-color);
  color: white;
}

.btn-cancel:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Modal Styles */
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

/* Breadcrumb */
.breadcrumb {
  background: transparent;
  padding: 0;
  margin: 0;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: white;
}
</style>
