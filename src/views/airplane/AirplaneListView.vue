<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="container">
    <VNavbar />

    <div class="header-section">
      <div class="header-icon">✈️</div>
      <h1 class="header-title">Airplane Management</h1>
      <p class="header-subtitle">Manage your aircraft fleet and monitor airplane status</p>
      <div class="header-actions">
        <router-link to="/airplanes/create" class="btn btn-primary">
          ➕ Register Airplane
        </router-link>
        <button @click="resetFilters" class="btn btn-secondary">
          🔄 Reset Filters
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label for="searchFilter">Search</label>
          <input
            v-model="filters.search"
            type="text"
            id="searchFilter"
            placeholder="Search by ID, model, or airline..."
            @input="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label for="statusFilter">Status</label>
          <select v-model="filters.status" id="statusFilter" @change="applyFilters">
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="airlineFilter">Airline</label>
          <select v-model="filters.airlineId" id="airlineFilter" @change="applyFilters">
            <option value="">All Airlines</option>
            <option v-for="airline in airlines" :key="airline.id" :value="airline.id">
              {{ airline.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="modelFilter">Model</label>
          <input
            v-model="filters.model"
            type="text"
            id="modelFilter"
            placeholder="Filter by model..."
            @input="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label for="yearFilter">Manufacture Year</label>
          <select v-model="filters.year" id="yearFilter" @change="applyFilters">
            <option value="">All Years</option>
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading airplanes...</p>
    </div>

    <!-- Table Section -->
    <div v-else class="table-section">
      <table v-if="filteredAirplanes.length > 0">
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
          <tr v-for="(airplane, index) in filteredAirplanes" :key="airplane.id">
            <td>{{ index + 1 }}</td>
            <td>{{ airplane.registrationNumber || airplane.id || '-' }}</td>
            <td>{{ airplane.airlineName || '-' }}</td>
            <td>{{ airplane.model || '-' }}</td>
            <td>{{ airplane.seatCapacity || 0 }}</td>
            <td>{{ airplane.manufactureYear || '-' }}</td>
            <td>
              <span :class="['status-badge', airplane.isDeleted ? 'status-inactive' : 'status-active']">
                {{ airplane.isDeleted ? 'Inactive' : 'Active' }}
              </span>
            </td>
            <td>{{ formatDateTime(airplane.createdAt) }}</td>
            <td>{{ formatDateTime(airplane.updatedAt) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  class="btn-icon btn-edit"
                  @click="editAirplane(airplane.id)"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  class="btn-icon btn-delete"
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

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🛩️</div>
        <h3 class="empty-title">No Airplanes Found</h3>
        <p class="empty-text">We couldn't find any airplanes matching your criteria</p>
        <button @click="resetFilters" class="btn btn-primary">🔄 Clear Filters</button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal show">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon">⚠️</div>
          <h2 class="modal-title">Confirm Deactivation</h2>
        </div>
        <div class="modal-body">
          <p class="modal-text">Are you sure you want to deactivate the airplane:</p>
          <div class="modal-airplane-id">
            {{ selectedAirplane?.registrationNumber || selectedAirplane?.id }}
          </div>
          <div class="modal-warning">
            <strong>⚠️ Important:</strong>
            Airplane cannot be deactivated if it is still used in active flights (Scheduled, In Flight, Delayed).
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="closeDeleteModal">Cancel</button>
          <button class="modal-btn modal-btn-confirm" @click="confirmDelete" :disabled="deleting">
            {{ deleting ? '⏳ Processing...' : 'Deactivate' }}
          </button>
        </div>
      </div>
    </div>
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
* { margin: 0; padding: 0; box-sizing: border-box; }

.container { max-width: 1400px; margin: 0 auto; padding: 20px; }

/* Header Section */
.header-section { text-align: center; color: white; margin-bottom: 30px; }
.header-icon { font-size: 2.5rem; margin-bottom: 10px; }
.header-title { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
.header-subtitle { font-size: 1rem; opacity: 0.95; margin-bottom: 25px; }
.header-actions { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }

.btn {
  padding: 12px 24px; border: none; border-radius: 8px; font-size: 0.95rem;
  font-weight: 600; cursor: pointer; transition: all 0.3s;
  text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
}
.btn-primary { background: white; color: #667eea; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3); }
.btn-secondary { background: rgba(255, 255, 255, 0.2); color: white; border: 2px solid white; }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.3); }

/* Error Message */
.error-message { background: #ffebee; color: #c62828; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }

/* Filter Section */
.filter-section { background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.filter-group { display: flex; flex-direction: column; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: #555; margin-bottom: 6px; }
.filter-group input, .filter-group select {
  padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 0.9rem; transition: border-color 0.3s;
}
.filter-group input:focus, .filter-group select:focus { outline: none; border-color: #667eea; }

/* Loading */
.loading { text-align: center; padding: 60px; color: white; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }

/* Table */
.table-section { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
thead th { padding: 15px; text-align: left; color: white; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
tbody tr { border-bottom: 1px solid #f0f0f0; transition: background 0.2s; }
tbody tr:hover { background: #f9f9f9; }
tbody td { padding: 15px; font-size: 0.9rem; color: #333; }

.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-active { background: #d4edda; color: #155724; }
.status-inactive { background: #f8d7da; color: #721c24; }

.action-buttons { display: flex; gap: 8px; }
.btn-icon {
  width: 35px; height: 35px; border: none; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.3s;
}
.btn-edit { background: #e3f2fd; color: #1976d2; }
.btn-edit:hover { background: #1976d2; color: white; }
.btn-delete { background: #ffebee; color: #c62828; }
.btn-delete:hover { background: #c62828; color: white; }

/* Empty State */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 4rem; opacity: 0.3; margin-bottom: 15px; }
.empty-title { font-size: 1.3rem; color: #333; margin-bottom: 10px; }
.empty-text { color: #666; margin-bottom: 20px; }

/* Modal */
.modal {
  display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center;
}
.modal.show { display: flex; }
.modal-content {
  background: white; border-radius: 16px; padding: 35px; max-width: 500px; width: 90%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3); animation: modalSlideIn 0.3s ease-out;
}
@keyframes modalSlideIn { from { transform: translateY(-50px); opacity: 0;} to { transform: translateY(0); opacity: 1;} }
.modal-header { text-align: center; margin-bottom: 25px; }
.modal-icon {
  width: 70px; height: 70px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
  font-size: 2.5rem; color: white; margin-bottom: 15px;
}
.modal-title { font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 10px; }
.modal-body { margin-bottom: 25px; text-align: center; }
.modal-text { color: #555; font-size: 1rem; margin-bottom: 15px; }
.modal-airplane-id { background: #f9f9f9; padding: 12px; border-radius: 8px; font-weight: 600; color: #667eea; font-size: 1.1rem; margin-bottom: 15px; }
.modal-warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 6px; font-size: 0.9rem; color: #856404; text-align: left; }
.modal-actions { display: flex; gap: 12px; justify-content: center; }
.modal-btn { padding: 12px 30px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-btn-cancel { background: #f5f5f5; color: #333; }
.modal-btn-cancel:hover { background: #e0e0e0; }
.modal-btn-confirm { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; }
.modal-btn-confirm:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,107,0.4); }
</style>
