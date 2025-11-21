<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="container">
    <VNavbar />

    <div class="header-section">
      <div class="header-icon">✏️</div>
      <h1 class="header-title">Edit Airplane</h1>
      <p class="header-subtitle">Update airplane information</p>
    </div>

    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>Loading airplane data...</p>
    </div>

    <div v-else class="form-card">
      <div v-if="errorMessage" class="error-message">
        ❌ {{ errorMessage }}
      </div>

      <div>
        <!-- Registration Number (Read-only) -->
        <div class="form-group">
          <label for="registrationNumber">Registration Number</label>
          <input
            :value="airplane?.registrationNumber || airplane?.id"
            type="text"
            id="registrationNumber"
            disabled
            class="readonly-field"
          />
          <div class="form-help">Registration number cannot be changed</div>
        </div>

        <!-- Airline Selection -->
        <div class="form-group">
          <label for="airlineId">
            Airline <span class="required">*</span>
          </label>
          <select
            v-model="formData.airlineId"
            id="airlineId"
            required
            :class="{ 'is-invalid': validationErrors.airlineId }"
          >
            <option value="">Select an airline</option>
            <option v-for="airline in airlines" :key="airline.id" :value="airline.id">
              {{ airline.name }} ({{ airline.id }})
            </option>
          </select>
          <div class="form-help">Change the airline if needed</div>
          <div v-if="validationErrors.airlineId" class="error-text">
            {{ validationErrors.airlineId }}
          </div>
        </div>

        <!-- Aircraft Model -->
        <div class="form-group">
          <label for="model">
            Aircraft Model <span class="required">*</span>
          </label>
          <input
            v-model="formData.model"
            type="text"
            id="model"
            placeholder="e.g. Boeing 737-800, Airbus A320"
            required
            :class="{ 'is-invalid': validationErrors.model }"
          />
          <div class="form-help">Enter the full model name of the aircraft</div>
          <div v-if="validationErrors.model" class="error-text">
            {{ validationErrors.model }}
          </div>
        </div>

        <!-- Seat Capacity -->
        <div class="form-group">
          <label for="seatCapacity">
            Seat Capacity <span class="required">*</span>
          </label>
          <input
            v-model.number="formData.seatCapacity"
            type="number"
            id="seatCapacity"
            placeholder="e.g. 180"
            min="1"
            required
            :class="{ 'is-invalid': validationErrors.seatCapacity }"
          />
          <div class="form-help">Total passenger seat capacity</div>
          <div v-if="validationErrors.seatCapacity" class="error-text">
            {{ validationErrors.seatCapacity }}
          </div>
        </div>

        <!-- Manufacture Year -->
        <div class="form-group">
          <label for="manufactureYear">
            Manufacture Year <span class="required">*</span>
          </label>
          <input
            v-model.number="formData.manufactureYear"
            type="number"
            id="manufactureYear"
            placeholder="e.g. 2025"
            min="1900"
            max="2030"
            required
            :class="{ 'is-invalid': validationErrors.manufactureYear }"
          />
          <div class="form-help">Year the aircraft was manufactured (1900-2030)</div>
          <div v-if="validationErrors.manufactureYear" class="error-text">
            {{ validationErrors.manufactureYear }}
          </div>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <div class="info-box-title">📝 Update Information</div>
          <div class="info-box-text">
            You can update the airplane details. The registration number and ID cannot be changed.
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <router-link to="/airplanes" class="btn btn-secondary">
            ✖️ Cancel
          </router-link>
          <button @click="handleSubmit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '⏳ Saving...' : '💾 Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAirplaneStore } from '@/stores/airplane/airplaneStore'
import { useAirlineStore } from '@/stores/airline/airlineStore'
import VNavbar from '@/components/common/VNavbar.vue'
import type { AirplaneRequest, Airplane } from '@/interfaces/airplane.interface'

const router = useRouter()
const route = useRoute()
const airplaneStore = useAirplaneStore()
const airlineStore = useAirlineStore()

const airplaneId = route.params.id as string
const airlines = computed(() => airlineStore.airlines)

const airplane = ref<Airplane | null>(null)
const loading = ref(true)

const formData = ref<AirplaneRequest>({
  airlineId: '',
  model: '',
  seatCapacity: 0,
  manufactureYear: new Date().getFullYear()
})

const validationErrors = ref<Record<string, string>>({})
const errorMessage = ref('')
const submitting = ref(false)

onMounted(async () => {
  try {
    await airlineStore.fetchAirlines()

    const data = await airplaneStore.getAirplaneById(airplaneId)
    airplane.value = data

    formData.value = {
      airlineId: data.airlineId,
      model: data.model,
      seatCapacity: data.seatCapacity,
      manufactureYear: data.manufactureYear
    }
  } catch (err: any) {
    console.error('Failed to load airplane:', err)
    errorMessage.value = err.response?.data?.message || 'Failed to load airplane data'
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  validationErrors.value = {}
  errorMessage.value = ''
  submitting.value = true

  try {
    await airplaneStore.updateAirplane(airplaneId, formData.value)
    alert('✅ Airplane updated successfully!')
    router.push('/airplanes')
  } catch (err: any) {
    console.error('Failed to update airplane:', err)

    if (err.response?.data?.data && typeof err.response.data.data === 'object') {
      validationErrors.value = err.response.data.data
      errorMessage.value = err.response.data.message || 'Validation failed'
    } else {
      errorMessage.value = err.response?.data?.message || err.message || 'Failed to update airplane'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }
.container { max-width: 800px; margin: 0 auto; padding: 20px; }
.header-section { text-align: center; color: white; margin-bottom: 30px; }
.header-icon { font-size: 2.5rem; margin-bottom: 10px; }
.header-title { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
.header-subtitle { font-size: 1rem; opacity: 0.95; }
.loading-box { background: white; border-radius: 16px; padding: 60px 40px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); text-align: center; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.form-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); }
.form-group { margin-bottom: 25px; }
.form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; font-size: 0.95rem; }
.form-group label .required { color: #e74c3c; }
.form-group input, .form-group select { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; }
.form-group input.is-invalid, .form-group select.is-invalid { border-color: #e74c3c; }
.readonly-field { background: #f5f5f5; cursor: not-allowed; color: #666; }
.form-help { font-size: 0.85rem; color: #666; margin-top: 6px; display: flex; align-items: center; gap: 5px; }
.form-help::before { content: "ℹ️"; }
.error-text { color: #e74c3c; font-size: 0.85rem; margin-top: 6px; }
.error-message { background: #ffebee; color: #c62828; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
.info-box { background: linear-gradient(135deg, #e3f2fd 0%, #e1bee7 100%); border-left: 4px solid #667eea; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
.info-box-title { font-weight: 600; color: #333; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }
.info-box-text { font-size: 0.9rem; color: #555; }
.form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; }
.btn { padding: 12px 30px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f5f5f5; color: #333; }
.btn-secondary:hover { background: #e0e0e0; }
@media (max-width: 768px) { .form-card { padding: 25px; } .form-actions { flex-direction: column; } .btn { width: 100%; justify-content: center; } }
</style>
