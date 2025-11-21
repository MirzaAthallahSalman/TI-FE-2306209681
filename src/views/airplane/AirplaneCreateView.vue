<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="container">
    <VNavbar />

    <div class="header-section">
      <div class="header-icon">➕</div>
      <h1 class="header-title">Register New Airplane</h1>
      <p class="header-subtitle">Add a new airplane to your aircraft fleet</p>
    </div>

    <div class="form-card">
      <div v-if="errorMessage" class="error-message">
        ❌ {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit">
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
          <div class="form-help">
            Airline dropdown, diambil dari daftar maskapai aktif
          </div>
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
          <div class="info-box-title">
            🔐 Auto Generated Registration Number
          </div>
          <div class="info-box-text">
            The registration number (e.g. <strong>GA-ABC</strong>) will be automatically
            generated after successful registration.
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <router-link to="/airplanes" class="btn btn-secondary">
            ✖️ Cancel
          </router-link>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '⏳ Processing...' : '✈️ Register Airplane' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal show">
      <div class="modal-content">
        <div class="modal-icon success">✓</div>
        <h2 class="modal-title">Airplane Registered Successfully!</h2>

        <div v-if="createdAirplane" class="modal-details">
          <div class="modal-detail-item">
            <div class="modal-detail-icon">📝</div>
            <div class="modal-detail-content">
              <div class="modal-detail-label">Registration Number</div>
              <div class="modal-detail-value">{{ createdAirplane.id }}</div>
            </div>
          </div>
          <div class="modal-detail-item">
            <div class="modal-detail-icon">✈️</div>
            <div class="modal-detail-content">
              <div class="modal-detail-label">Model</div>
              <div class="modal-detail-value">{{ createdAirplane.model }}</div>
            </div>
          </div>
          <div class="modal-detail-item">
            <div class="modal-detail-icon">🏢</div>
            <div class="modal-detail-content">
              <div class="modal-detail-label">Airline</div>
              <div class="modal-detail-value">{{ createdAirplane.airlineName }}</div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <router-link to="/airplanes" class="btn btn-primary">
            ✈️ View All Airplanes
          </router-link>
          <button @click="registerAnother" class="btn btn-secondary">
            ➕ Register Another
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
import type { AirplaneRequest } from '@/interfaces/airplane.interface'
import type { Airplane } from '@/interfaces/airplane.interface'

const router = useRouter()
const airplaneStore = useAirplaneStore()
const airlineStore = useAirlineStore()

const airlines = computed(() => airlineStore.airlines)

const formData = ref<AirplaneRequest>({
  airlineId: '',
  model: '',
  seatCapacity: 0,
  manufactureYear: new Date().getFullYear()
})

const validationErrors = ref<Record<string, string>>({})
const errorMessage = ref('')
const submitting = ref(false)
const showSuccessModal = ref(false)
const createdAirplane = ref<Airplane | null>(null)

onMounted(async () => {
  try {
    await airlineStore.fetchAirlines()
  } catch (err) {
    console.error('Failed to load airlines:', err)
    errorMessage.value = 'Failed to load airlines. Please refresh the page.'
  }
})

const handleSubmit = async () => {
  validationErrors.value = {}
  errorMessage.value = ''
  submitting.value = true

  try {
    const result = await airplaneStore.createAirplane(formData.value)
    createdAirplane.value = result
    showSuccessModal.value = true
  } catch (err: any) {
    console.error('Failed to create airplane:', err)

    // Handle validation errors
    if (err.response?.data?.data && typeof err.response.data.data === 'object') {
      validationErrors.value = err.response.data.data
      errorMessage.value = err.response.data.message || 'Validation failed'
    } else {
      errorMessage.value = err.response?.data?.message || err.message || 'Failed to register airplane'
    }
  } finally {
    submitting.value = false
  }
}

const registerAnother = () => {
  showSuccessModal.value = false
  createdAirplane.value = null
  formData.value = {
    airlineId: '',
    model: '',
    seatCapacity: 0,
    manufactureYear: new Date().getFullYear()
  }
  validationErrors.value = {}
  errorMessage.value = ''
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.container { max-width: 800px; margin: 0 auto; padding: 20px; }

/* Header */
.header-section { text-align: center; color: white; margin-bottom: 30px; }
.header-icon { font-size: 2.5rem; margin-bottom: 10px; }
.header-title { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
.header-subtitle { font-size: 1rem; opacity: 0.95; }

/* Form Card */
.form-card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); }

.form-group { margin-bottom: 25px; }
.form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; font-size: 0.95rem; }
.form-group label .required { color: #e74c3c; }
.form-group input, .form-group select {
  width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px;
  font-size: 1rem; transition: border-color 0.3s;
}
.form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; }
.form-group input.is-invalid, .form-group select.is-invalid { border-color: #e74c3c; }

.form-help {
  font-size: 0.85rem; color: #666; margin-top: 6px;
  display: flex; align-items: center; gap: 5px;
}
.form-help::before { content: "ℹ️"; }

.error-text { color: #e74c3c; font-size: 0.85rem; margin-top: 6px; }
.error-message { background: #ffebee; color: #c62828; padding: 12px; border-radius: 8px; margin-bottom: 20px; }

/* Info Box */
.info-box {
  background: linear-gradient(135deg, #e3f2fd 0%, #e1bee7 100%);
  border-left: 4px solid #667eea; padding: 15px; border-radius: 8px; margin-bottom: 25px;
}
.info-box-title { font-weight: 600; color: #333; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }
.info-box-text { font-size: 0.9rem; color: #555; }

/* Form Actions */
.form-actions {
  display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;
  padding-top: 20px; border-top: 2px solid #f0f0f0;
}

.btn {
  padding: 12px 30px; border: none; border-radius: 8px; font-size: 1rem;
  font-weight: 600; cursor: pointer; transition: all 0.3s;
  text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
}
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f5f5f5; color: #333; }
.btn-secondary:hover { background: #e0e0e0; }

/* Success Modal */
.modal {
  display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); z-index: 1000; align-items: center; justify-content: center;
}
.modal.show { display: flex; }
.modal-content {
  background: white; border-radius: 16px; padding: 40px; max-width: 500px;
  text-align: center; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
.modal-icon {
  width: 80px; height: 80px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.5rem; margin: 0 auto 20px; color: white;
}
.modal-icon.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.modal-title { font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 15px; }

.modal-details {
  text-align: left; background: #f9f9f9; padding: 20px;
  border-radius: 8px; margin: 20px 0;
}
.modal-detail-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}
.modal-detail-item:last-child { border-bottom: none; }
.modal-detail-icon {
  width: 35px; height: 35px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;
}
.modal-detail-content { flex: 1; }
.modal-detail-label { font-size: 0.8rem; color: #888; text-transform: uppercase; }
.modal-detail-value { font-weight: 600; color: #333; }

.modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }

@media (max-width: 768px) {
  .form-card { padding: 25px; }
  .form-actions { flex-direction: column; }
  .btn { width: 100%; justify-content: center; }
}
</style>
