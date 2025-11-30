<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="flight-update-container">
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
          <router-link to="/bookings" class="nav-link">Flight Bookings</router-link>
        </div>
      </div>
    </nav>

    <!-- Main Container -->
    <div class="container main-container">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-white">Home</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/flights" class="text-white">All Flights</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link :to="`/flights/${flightId}`" class="text-white">
              {{ flight?.flightNumber || flightId }}
            </router-link>
          </li>
          <li class="breadcrumb-item active text-white" aria-current="page">Update</li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <i class="bi bi-pencil-square"></i> Update Flight
        </div>
        <div class="text-muted">Updating flight {{ flight?.flightNumber || flightId }}</div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="alertMessage" :class="['alert', alertClass, 'alert-dismissible', 'fade', 'show']" role="alert">
        <strong>{{ alertTitle }}</strong> {{ alertMessage }}
        <button type="button" class="btn-close" @click="clearAlert"></button>
      </div>

      <!-- Update Form -->
      <form v-if="!loading && flight" @submit.prevent="handleSubmit">
        <!-- Flight Information (Read-only) -->
        <div class="form-section">
          <div class="section-title">
            <i class="bi bi-info-circle"></i>
            Flight Information
          </div>
          <div class="info-box">
            <p>Basic flight details (cannot be modified)</p>
          </div>
          <div class="row">
            <div class="col-md-3">
              <label class="form-label">Flight Number</label>
              <input type="text" class="form-control" :value="flight.flightNumber" readonly />
            </div>
            <div class="col-md-3">
              <label class="form-label">Airline</label>
              <input type="text" class="form-control" :value="flight.airlineName" readonly />
            </div>
            <div class="col-md-3">
              <label class="form-label">Aircraft</label>
              <input
                type="text"
                class="form-control"
                :value="`${flight.aircraftInfo?.model} (Capacity: ${flight.aircraftInfo?.seatCapacity} seats)`"
                readonly
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <input type="text" class="form-control" :value="flight.statusText" readonly />
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-6">
              <label class="form-label">Route</label>
              <input
                type="text"
                class="form-control"
                :value="`${flight.originAirportCode} → ${flight.destinationAirportCode}`"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- Schedule Information -->
        <div class="form-section">
          <div class="section-title">
            <i class="bi bi-calendar3"></i>
            Schedule Information
          </div>
          <div class="info-box">
            <p>Update flight departure and arrival times</p>
          </div>
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Departure Time *</label>
              <input v-model="formData.departureTime" type="datetime-local" class="form-control" required />
              <small class="text-muted">Must be in the future</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Arrival Time *</label>
              <input v-model="formData.arrivalTime" type="datetime-local" class="form-control" required />
              <small class="text-muted">Must be after departure time</small>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-6">
              <label class="form-label">Terminal</label>
              <input v-model="formData.terminal" type="text" class="form-control" placeholder="e.g., Terminal 2" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Gate *</label>
              <input v-model="formData.gate" type="text" class="form-control" required placeholder="e.g., A12" />
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="form-section">
          <div class="section-title">
            <i class="bi bi-gear"></i>
            Additional Information
          </div>
          <div class="info-box">
            <p>Update baggage allowance and facilities</p>
          </div>
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Baggage Allowance (kg) *</label>
              <input v-model.number="formData.baggageAllowance" type="number" class="form-control" min="0" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Facilities</label>
              <input
                v-model="formData.facilities"
                type="text"
                class="form-control"
                placeholder="e.g., WiFi, Meal, Entertainment"
              />
              <small class="text-muted">Separate multiple facilities with commas</small>
            </div>
          </div>
        </div>

        <!-- Class Configuration -->
        <div class="form-section">
          <div class="section-title">
            <i class="bi bi-layers"></i>
            Class Configuration
          </div>
          <div class="info-box">
            <p>Configure seat classes and pricing</p>
          </div>

          <div id="classContainer">
            <!-- Empty state when no classes -->
            <div v-if="formData.classFlights.length === 0" class="empty-class-state">
              <i class="bi bi-layers"></i>
              <p>No class configuration yet. Click "Add Class" to add a class.</p>
            </div>

            <!-- Class cards -->
            <div 
              v-for="(classItem, index) in formData.classFlights" 
              :key="`class-${index}-${classItem.classType}`" 
              :class="['class-card', { 'new-class': !classItem.id }]"
            >
              <div class="class-header">
                <div class="class-number">
                  <span :class="['class-badge', getClassBadgeStyle(classItem.classType)]">
                    {{ getClassName(classItem.classType) }}
                  </span>
                  <span v-if="!classItem.id" class="new-badge">NEW</span>
                </div>
                <button type="button" class="btn-remove-class" @click="removeClass(index)">
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
              <div class="row">
                <div class="col-md-4">
                  <label class="form-label">Class Type *</label>
                  <select 
                    v-model.number="classItem.classType" 
                    class="form-select" 
                    required
                    :disabled="classItem.id !== null"
                  >
                    <option :value="1">Economy</option>
                    <option :value="2">Business</option>
                    <option :value="3">First Class</option>
                  </select>
                  <small v-if="classItem.id" class="text-muted">
                    <i class="bi bi-lock"></i> Class type cannot be changed for existing classes
                  </small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Seat Capacity *</label>
                  <input v-model.number="classItem.seatCapacity" type="number" class="form-control" min="1" required />
                  <small v-if="classItem.id" class="text-muted">
                    <i class="bi bi-info-circle"></i> Available: {{ getAvailableSeats(classItem) }} seats
                  </small>
                  <small v-else class="text-success">
                    <i class="bi bi-plus-circle"></i> New seats will be created
                  </small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Price (IDR) *</label>
                  <input v-model.number="classItem.price" type="number" class="form-control" min="0" required />
                  <small class="text-muted">Estimated: Rp {{ formatPrice(classItem.price) }}</small>
                </div>
              </div>
              <div class="row mt-2">
                <div class="col-12">
                  <div :class="['class-summary', { 'existing-class': classItem.id, 'new-class-summary': !classItem.id }]">
                    <span v-if="classItem.id">
                      <i class="bi bi-check-circle"></i> Existing class - 
                      <strong>{{ classItem.seatCapacity }}</strong> seats at 
                      <strong>Rp {{ formatPrice(classItem.price) }}</strong>
                    </span>
                    <span v-else>
                      <i class="bi bi-plus-circle"></i> New class will be created - 
                      <strong>{{ classItem.seatCapacity }}</strong> seats at 
                      <strong>Rp {{ formatPrice(classItem.price) }}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Class Button -->
          <button 
            type="button" 
            class="btn-add-class" 
            @click="addNewClass"
            :disabled="formData.classFlights.length >= 3"
          >
            <i class="bi bi-plus-circle"></i> Add Class
            <span v-if="formData.classFlights.length >= 3" class="ms-2">(Max 3 classes)</span>
          </button>

          <!-- Class count indicator -->
          <div class="class-count-indicator">
            <span>{{ formData.classFlights.length }} / 3 classes configured</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button type="submit" class="btn btn-custom btn-save" :disabled="submitting">
            <i class="bi bi-check-circle"></i>
            {{ submitting ? 'Saving...' : 'Save Updates' }}
          </button>
          <button type="button" class="btn btn-custom btn-cancel-action" @click="cancelUpdate">
            <i class="bi bi-x-circle"></i> Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flightStore'
import type { FlightDetailResponse, FlightUpdateRequest, ClassFlightUpdate } from '@/interfaces/flight.interface'

const route = useRoute()
const router = useRouter()
const flightStore = useFlightStore()

// State
const loading = ref(true)
const submitting = ref(false)
const flightId = ref(route.params.id as string)
const flight = ref<FlightDetailResponse | null>(null)

const formData = ref<FlightUpdateRequest>({
  departureTime: '',
  arrivalTime: '',
  terminal: '',
  gate: '',
  baggageAllowance: 0,
  facilities: '',
  classFlights: []
})

// Alert state
const alertMessage = ref<string | null>(null)
const alertClass = ref('alert-success')
const alertTitle = ref('Success!')

// Methods
const loadFlightData = async () => {
  loading.value = true
  try {
    const data = await flightStore.getFlightForUpdate(flightId.value)
    flight.value = data

    // Populate form
    formData.value = {
      departureTime: formatDateTimeLocal(new Date(data.departureTime)),
      arrivalTime: formatDateTimeLocal(new Date(data.arrivalTime)),
      terminal: data.terminal || '',
      gate: data.gate || '',
      baggageAllowance: data.baggageAllowance || 0,
      facilities: data.facilities || '',
      classFlights: data.classFlights.map((cf) => ({
        id: cf.id,
        classType: cf.classType,
        seatCapacity: cf.totalSeats,
        price: cf.price
      }))
    }

    // If no classes, add default economy
    if (formData.value.classFlights.length === 0) {
      addNewClass()
    }
  } catch (error: any) {
    console.error('Error loading flight:', error)
    showAlert('error', error.response?.data?.message || error.message || 'Failed to load flight')
  } finally {
    loading.value = false
  }
}

const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const addNewClass = () => {
  // Find available class type (not already used)
  const usedClassTypes = formData.value.classFlights.map(cf => cf.classType)
  let availableClassType = 1
  
  if (!usedClassTypes.includes(1)) {
    availableClassType = 1 // Economy
  } else if (!usedClassTypes.includes(2)) {
    availableClassType = 2 // Business
  } else if (!usedClassTypes.includes(3)) {
    availableClassType = 3 // First Class
  } else {
    showAlert('warning', 'All class types (Economy, Business, First Class) are already added')
    return
  }

  const newClass: ClassFlightUpdate = {
    id: null,
    classType: availableClassType,
    seatCapacity: availableClassType === 1 ? 150 : availableClassType === 2 ? 30 : 10,
    price: availableClassType === 1 ? 500000 : availableClassType === 2 ? 1500000 : 3000000
  }
  
  // Push new class to array
  formData.value.classFlights.push(newClass)
  
  // Show success message
  showAlert('success', `New ${getClassName(availableClassType)} class added successfully!`)
}

const removeClass = (index: number) => {
  // Check if this is the last class
  if (formData.value.classFlights.length <= 1) {
    showAlert('warning', 'Flight must have at least one class configuration')
    return
  }

  if (confirm('Are you sure you want to remove this class?')) {
    formData.value.classFlights.splice(index, 1)
  }
}

const getAvailableSeats = (classItem: ClassFlightUpdate): number => {
  if (!classItem.id || !flight.value) return 0
  const originalClass = flight.value.classFlights.find((cf) => cf.id === classItem.id)
  return originalClass?.availableSeats || 0
}

const getClassName = (classType: number): string => {
  const classMap: Record<number, string> = {
    1: 'Economy',
    2: 'Business',
    3: 'First Class'
  }
  return classMap[classType] || 'Unknown'
}

const getClassBadgeStyle = (classType: number): string => {
  const styleMap: Record<number, string> = {
    1: 'economy-badge',
    2: 'business-badge',
    3: 'first-badge'
  }
  return styleMap[classType] || 'economy-badge'
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price || 0)
}

const cancelUpdate = () => {
  if (confirm('Discard changes and go back?')) {
    router.push(`/flights/${flightId.value}`)
  }
}

const handleSubmit = async () => {
  try {
    // Validate times
    const depTime = new Date(formData.value.departureTime)
    const arrTime = new Date(formData.value.arrivalTime)

    if (depTime >= arrTime) {
      throw new Error('Arrival time must be after departure time')
    }

    if (depTime <= new Date()) {
      throw new Error('Departure time must be in the future')
    }

    // Prepare update data
    const updateData: FlightUpdateRequest = {
      departureTime: depTime.toISOString(),
      arrivalTime: arrTime.toISOString(),
      terminal: formData.value.terminal || undefined,
      gate: formData.value.gate,
      baggageAllowance: formData.value.baggageAllowance,
      facilities: formData.value.facilities || undefined,
      classFlights: formData.value.classFlights.map((cf) => ({
        id: cf.id || null,
        classType: cf.classType,
        seatCapacity: cf.seatCapacity,
        price: cf.price
      }))
    }

    submitting.value = true
    await flightStore.updateFlight(flightId.value, updateData)

    showAlert('success', 'Flight updated successfully!')

    // Redirect to detail page after 1.5 seconds
    setTimeout(() => {
      router.push(`/flights/${flightId.value}`)
    }, 1500)
  } catch (error: any) {
    console.error('Error updating flight:', error)
    showAlert('error', error.response?.data?.error || error.message || 'Failed to update flight')
  } finally {
    submitting.value = false
  }
}

const showAlert = (type: 'success' | 'warning' | 'error', message: string) => {
  alertMessage.value = message

  if (type === 'success') {
    alertClass.value = 'alert-success'
    alertTitle.value = 'Success!'
  } else if (type === 'warning') {
    alertClass.value = 'alert-warning'
    alertTitle.value = 'Warning!'
  } else {
    alertClass.value = 'alert-danger'
    alertTitle.value = 'Error!'
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    clearAlert()
  }, 5000)
}

const clearAlert = () => {
  alertMessage.value = null
}

// Lifecycle
onMounted(() => {
  loadFlightData()
})
</script>

<style scoped>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';

:root {
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
}

.flight-update-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px 0;
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
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary-color);
}

.main-container {
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.form-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-box {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-control:read-only {
  background-color: #f9fafb;
}

.class-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  transition: all 0.3s ease;
}

.class-card.new-class {
  border-color: var(--success-color);
  background: linear-gradient(to right, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02));
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  }
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.class-number {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.class-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.economy-badge {
  background: #dbeafe;
  color: #1d4ed8;
}

.business-badge {
  background: #fef3c7;
  color: #b45309;
}

.first-badge {
  background: #fce7f3;
  color: #be185d;
}

.new-badge {
  background: var(--success-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.empty-class-state {
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  margin-bottom: 1rem;
}

.empty-class-state i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.class-summary {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.class-summary.existing-class {
  background: #f3f4f6;
  color: #4b5563;
}

.class-summary.new-class-summary {
  background: #d1fae5;
  color: #065f46;
}

.class-count-indicator {
  text-align: center;
  margin-top: 0.75rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.btn-remove-class {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-remove-class:hover {
  background: #dc2626;
}

.btn-add-class {
  background: var(--success-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.btn-add-class:hover:not(:disabled) {
  background: #059669;
}

.btn-add-class:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
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

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel-action {
  background: #6b7280;
  color: white;
}

.btn-cancel-action:hover {
  background: #4b5563;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.alert {
  border-radius: 12px;
  border: none;
  padding: 1rem 1.5rem;
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

.breadcrumb-item a {
  color: white;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}
</style>
