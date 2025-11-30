<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="page-wrapper">
    <VNavbar />

    <!-- Hero Header Section -->
    <div class="hero-header">
      <div class="hero-content">
        <div class="plane-icon">✈️</div>
        <h1 class="hero-title">Airplane Management</h1>
        <p class="hero-subtitle">Manage your aircraft fleet and monitor airplane status</p>
        <div class="hero-actions">
          <router-link to="/airplanes/create" class="btn-register">
            <span class="btn-icon">➕</span> Register Airplane
          </router-link>
          <button @click="resetFilters" class="btn-reset">
            <span class="btn-icon">🔄</span> Reset Filters
          </button>
        </div>
      </div>
    </div>

    <div class="main-container">
      <div v-if="error" class="alert-error">
        ⚠️ {{ error }}
      </div>

      <!-- Filter Card -->
      <div class="filter-card">
        <div class="filter-grid">
          <div class="input-group">
            <label class="input-label">Search</label>
            <input
              v-model="filters.search"
              type="text"
              class="input-field"
              placeholder="Search by ID, model, or airline..."
              @input="applyFilters"
            />
          </div>

          <div class="input-group">
            <label class="input-label">Status</label>
            <select v-model="filters.status" class="input-field" @change="applyFilters">
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          <div class="input-group">
            <label class="input-label">Airline</label>
            <select v-model="filters.airlineId" class="input-field" @change="applyFilters">
              <option value="">All Airlines</option>
              <option v-for="airline in airlines" :key="airline.id" :value="airline.id">
                {{ airline.name }}
              </option>
            </select>
          </div>

          <div class="input-group">
            <label class="input-label">Model</label>
            <input
              v-model="filters.model"
              type="text"
              class="input-field"
              placeholder="Filter by model..."
              @input="applyFilters"
            />
          </div>

          <div class="input-group">
            <label class="input-label">Manufacture Year</label>
            <select v-model="filters.year" class="input-field" @change="applyFilters">
              <option value="">All Years</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading airplanes...</p>
      </div>

      <!-- Data Table -->
      <div v-else class="table-card">
        <div v-if="filteredAirplanes.length > 0" class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>REGISTRATION NUMBER</th>
                <th>AIRLINE</th>
                <th>MODEL</th>
                <th>SEAT CAPACITY</th>
                <th>MANUFACTURE YEAR</th>
                <th>STATUS</th>
                <th>CREATED AT</th>
                <th>UPDATED AT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(airplane, index) in filteredAirplanes" :key="airplane.id" class="table-row">
                <td class="cell-number">{{ index + 1 }}</td>
                <td class="cell-primary">{{ airplane.registrationNumber || airplane.id || '-' }}</td>
                <td>{{ airplane.airlineName || '-' }}</td>
                <td>{{ airplane.model || '-' }}</td>
                <td class="cell-center">{{ airplane.seatCapacity || 0 }}</td>
                <td class="cell-center">{{ airplane.manufactureYear || '-' }}</td>
                <td>
                  <span :class="['badge', airplane.isDeleted ? 'badge-inactive' : 'badge-active']">
                    {{ airplane.isDeleted ? 'Inactive' : 'Active' }}
                  </span>
                </td>
                <td class="cell-date">{{ formatDateTime(airplane.createdAt) }}</td>
                <td class="cell-date">{{ formatDateTime(airplane.updatedAt) }}</td>
                <td>
                  <div class="action-group">
                    <button
                      class="action-btn action-edit"
                      @click="editAirplane(airplane.id)"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      class="action-btn action-delete"
                      @click="openDeleteModal(airplane)"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">✈️</div>
          <h3 class="empty-title">No Airplanes Found</h3>
          <p class="empty-description">We couldn't find any airplanes matching your criteria</p>
          <button @click="resetFilters" class="btn-empty-action">
            🔄 Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-icon-wrapper">
              <span class="modal-icon">⚠️</span>
            </div>
            <h2 class="modal-title">Confirm Deactivation</h2>
          </div>

          <div class="modal-body">
            <p class="modal-message">Are you sure you want to deactivate the airplane:</p>
            <div class="modal-airplane-info">
              {{ selectedAirplane?.registrationNumber || selectedAirplane?.id }}
            </div>
            <div class="modal-warning">
              <strong>⚠️ Important:</strong>
              Airplane cannot be deactivated if it is still used in active flights (Scheduled, In Flight, Delayed).
            </div>
          </div>

          <div class="modal-footer">
            <button class="modal-btn modal-btn-cancel" @click="closeDeleteModal">
              Cancel
            </button>
            <button
              class="modal-btn modal-btn-confirm"
              @click="confirmDelete"
              :disabled="deleting"
            >
              {{ deleting ? '⏳ Processing...' : 'Deactivate' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAirplaneStore } from '@/stores/airplane/airplaneStore'
import { useAirlineStore } from '@/stores/airline/airlineStore'
import VNavbar from '@/components/common/VNavbar.vue'
import type { Airplane } from '@/interfaces/airplane.interface'

const router = useRouter()
const airplaneStore = useAirplaneStore()
const airlineStore = useAirlineStore()

const loading = computed(() => airplaneStore.loading)
const error = computed(() => airplaneStore.error)
const airplanes = computed(() => airplaneStore.airplanes)
const airlines = computed(() => airlineStore.airlines)

const filters = ref({
  search: '',
  status: 'true',
  airlineId: '',
  model: '',
  year: ''
})

const filteredAirplanes = ref<Airplane[]>([])
const showDeleteModal = ref(false)
const selectedAirplane = ref<Airplane | null>(null)
const deleting = ref(false)

const years = computed(() => {
  const allYears = airplanes.value.map(a => a.manufactureYear)
  return [...new Set(allYears)].sort((a, b) => b - a)
})

onMounted(async () => {
  try {
    await Promise.all([
      airplaneStore.fetchAirplanes(),
      airlineStore.fetchAirlines()
    ])
    applyFilters()
  } catch (err) {
    console.error('Failed to load data:', err)
  }
})

const applyFilters = () => {
  let result = [...airplanes.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(a =>
      a.registrationNumber?.toLowerCase().includes(search) ||
      a.model?.toLowerCase().includes(search) ||
      a.airlineName?.toLowerCase().includes(search)
    )
  }

  if (filters.value.status !== '') {
    const isActive = filters.value.status === 'true'
    result = result.filter(a => a.isDeleted === !isActive)
  }

  if (filters.value.airlineId) {
    result = result.filter(a => a.airlineId === filters.value.airlineId)
  }

  if (filters.value.model) {
    const model = filters.value.model.toLowerCase()
    result = result.filter(a => a.model?.toLowerCase().includes(model))
  }

  if (filters.value.year) {
    result = result.filter(a => a.manufactureYear === parseInt(filters.value.year))
  }

  filteredAirplanes.value = result
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: 'true',
    airlineId: '',
    model: '',
    year: ''
  }
  applyFilters()
}

const editAirplane = (id: string) => {
  router.push(`/airplanes/${id}/edit`)
}

const openDeleteModal = (airplane: Airplane) => {
  selectedAirplane.value = airplane
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedAirplane.value = null
}

const confirmDelete = async () => {
  if (!selectedAirplane.value) return

  deleting.value = true
  try {
    await airplaneStore.deleteAirplane(selectedAirplane.value.id)
    alert('✅ Airplane deactivated successfully!')
    closeDeleteModal()
    applyFilters()
  } catch (err: any) {
    alert('❌ Error: ' + (err.response?.data?.message || err.message))
  } finally {
    deleting.value = false
  }
}

const formatDateTime = (datetime: string | null): string => {
  if (!datetime) return '-'
  try {
    const date = new Date(datetime)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 40px;
  text-align: center;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
}

.plane-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 15px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 35px;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-register,
.btn-reset {
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-register {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-register:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255,255,255,0.3);
}

.btn-reset {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 2px solid white;
  backdrop-filter: blur(10px);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Main Container */
.main-container {
  max-width: 1400px;
  margin: -20px auto 0;
  padding: 0 20px 40px;
}

/* Alert */
.alert-error {
  background: white;
  color: #d32f2f;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-weight: 500;
}

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.input-field {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Loading State */
.loading-state {
  background: white;
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 1.1rem;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.data-table th {
  padding: 18px 16px;
  text-align: left;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.data-table tbody tr {
  transition: background 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background: #f8f9ff;
}

.data-table td {
  padding: 18px 16px;
  font-size: 0.95rem;
  color: #333;
}

.cell-number {
  font-weight: 600;
  color: #667eea;
}

.cell-primary {
  font-weight: 600;
  color: #333;
}

.cell-center {
  text-align: center;
}

.cell-date {
  color: #666;
  font-size: 0.9rem;
}

.badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
}

.badge-active {
  background: #d4edda;
  color: #155724;
}

.badge-inactive {
  background: #f8d7da;
  color: #721c24;
}

.action-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.action-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-edit:hover {
  background: #1976d2;
  color: white;
  transform: scale(1.1);
}

.action-delete {
  background: #ffebee;
  color: #c62828;
}

.action-delete:hover {
  background: #c62828;
  color: white;
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 5rem;
  opacity: 0.3;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.empty-description {
  color: #666;
  font-size: 1rem;
  margin-bottom: 25px;
}

.btn-empty-action {
  padding: 12px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-empty-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
  backdrop-filter: blur(4px);
}

.modal-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 520px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.modal-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.modal-icon {
  font-size: 3rem;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.modal-body {
  text-align: center;
  margin-bottom: 30px;
}

.modal-message {
  color: #555;
  font-size: 1.05rem;
  margin-bottom: 20px;
}

.modal-airplane-info {
  background: linear-gradient(135deg, #f5f7ff 0%, #e8ebff 100%);
  padding: 15px 20px;
  border-radius: 12px;
  font-weight: 700;
  color: #667eea;
  font-size: 1.3rem;
  margin-bottom: 20px;
}

.modal-warning {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 15px 18px;
  border-radius: 8px;
  text-align: left;
  font-size: 0.95rem;
  color: #856404;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.modal-btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-box,
.modal-fade-leave-active .modal-box {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-box,
.modal-fade-leave-to .modal-box {
  transform: scale(0.9);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 0.85rem;
  }

  .data-table th,
  .data-table td {
    padding: 12px 10px;
  }
}
</style>
