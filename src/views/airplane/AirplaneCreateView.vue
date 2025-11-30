<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="page-wrapper">
    <VNavbar />

    <!-- Hero Header -->
    <div class="hero-header">
      <div class="hero-content">
        <div class="plane-icon">✈️</div>
        <h1 class="hero-title">Register New Airplane</h1>
        <p class="hero-subtitle">Add a new airplane to your aircraft fleet</p>
      </div>
    </div>

    <div class="main-container">
      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert-error">
        ⚠️ {{ errorMessage }}
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <!-- Airline Selection -->
          <div class="form-group">
            <label for="airlineId" class="form-label">
              Airline <span class="required">*</span>
            </label>
            <select
              v-model="formData.airlineId"
              id="airlineId"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.airlineId }"
              required
            >
              <option value="">Select an airline</option>
              <option v-for="airline in airlines" :key="airline.id" :value="airline.id">
                {{ airline.name }} ({{ airline.id }})
              </option>
            </select>
            <div class="form-help">
              <span class="help-icon">ℹ️</span>
              Airline dropdown, diambil dari daftar maskapai aktif
            </div>
            <div v-if="validationErrors.airlineId" class="error-text">
              {{ validationErrors.airlineId }}
            </div>
          </div>

          <!-- Aircraft Model -->
          <div class="form-group">
            <label for="model" class="form-label">
              Aircraft Model <span class="required">*</span>
            </label>
            <input
              v-model="formData.model"
              type="text"
              id="model"
              class="form-control"
              placeholder="e.g. Boeing 737-800, Airbus A320"
              :class="{ 'is-invalid': validationErrors.model }"
              required
            />
            <div class="form-help">
              <span class="help-icon">ℹ️</span>
              Enter the full model name of the aircraft
            </div>
            <div v-if="validationErrors.model" class="error-text">
              {{ validationErrors.model }}
            </div>
          </div>

          <!-- Seat Capacity -->
          <div class="form-group">
            <label for="seatCapacity" class="form-label">
              Seat Capacity <span class="required">*</span>
            </label>
            <input
              v-model.number="formData.seatCapacity"
              type="number"
              id="seatCapacity"
              class="form-control"
              placeholder="e.g. 180"
              min="1"
              :class="{ 'is-invalid': validationErrors.seatCapacity }"
              required
            />
            <div class="form-help">
              <span class="help-icon">ℹ️</span>
              Total passenger seat capacity
            </div>
            <div v-if="validationErrors.seatCapacity" class="error-text">
              {{ validationErrors.seatCapacity }}
            </div>
          </div>

          <!-- Manufacture Year -->
          <div class="form-group">
            <label for="manufactureYear" class="form-label">
              Manufacture Year <span class="required">*</span>
            </label>
            <input
              v-model.number="formData.manufactureYear"
              type="number"
              id="manufactureYear"
              class="form-control"
              placeholder="e.g. 2025"
              min="1900"
              max="2030"
              :class="{ 'is-invalid': validationErrors.manufactureYear }"
              required
            />
            <div class="form-help">
              <span class="help-icon">ℹ️</span>
              Year the aircraft was manufactured (1900-2030)
            </div>
            <div v-if="validationErrors.manufactureYear" class="error-text">
              {{ validationErrors.manufactureYear }}
            </div>
          </div>

          <!-- Info Box -->
          <div class="info-box">
            <div class="info-box-icon">🔐</div>
            <div class="info-box-content">
              <div class="info-box-title">Auto Generated Registration Number</div>
              <div class="info-box-text">
                The registration number (e.g. <strong>GA-ABC</strong>) will be automatically
                generated after successful registration.
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <router-link to="/airplanes" class="btn-cancel">
              ✖️ Cancel
            </router-link>
            <button type="submit" class="btn-submit" :disabled="submitting">
              <span v-if="!submitting">✈️ Register Airplane</span>
              <span v-else>⏳ Processing...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <transition name="modal-fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="() => {}">
        <div class="modal-box success-modal">
          <div class="success-icon-wrapper">
            <div class="success-icon">✓</div>
          </div>

          <h2 class="modal-title">Airplane Registered Successfully!</h2>

          <div v-if="createdAirplane" class="success-details">
            <div class="detail-item">
              <div class="detail-icon">📝</div>
              <div class="detail-content">
                <div class="detail-label">Registration Number</div>
                <div class="detail-value">{{ createdAirplane.id }}</div>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon">✈️</div>
              <div class="detail-content">
                <div class="detail-label">Model</div>
                <div class="detail-value">{{ createdAirplane.model }}</div>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon">🏢</div>
              <div class="detail-content">
                <div class="detail-label">Airline</div>
                <div class="detail-value">{{ createdAirplane.airlineName }}</div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <router-link to="/airplanes" class="btn-primary">
              ✈️ View All Airplanes
            </router-link>
            <button @click="registerAnother" class="btn-secondary">
              ➕ Register Another
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
  max-width: 800px;
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
  font-weight: 400;
}

/* Main Container */
.main-container {
  max-width: 800px;
  margin: -20px auto 0;
  padding: 0 20px 40px;
}

/* Alert Error */
.alert-error {
  background: white;
  color: #d32f2f;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-weight: 500;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* Form Group */
.form-group {
  margin-bottom: 28px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
  margin-left: 2px;
}

.form-control {
  width: 100%;
  padding: 13px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control.is-invalid {
  border-color: #e74c3c;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.form-help {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
  margin-top: 8px;
  line-height: 1.4;
}

.help-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 8px;
  font-weight: 500;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 15px;
  background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%);
  border-left: 4px solid #667eea;
  padding: 18px 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  align-items: flex-start;
}

.info-box-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-box-content {
  flex: 1;
}

.info-box-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.info-box-text {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 35px;
  padding-top: 25px;
  border-top: 2px solid #f0f0f0;
}

.btn-cancel,
.btn-submit {
  padding: 13px 28px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-width: 200px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  backdrop-filter: blur(4px);
}

.modal-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 520px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
}

.success-icon-wrapper {
  margin-bottom: 25px;
}

.success-icon {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: white;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(17, 153, 142, 0.3);
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 25px;
}

/* Success Details */
.success-details {
  background: linear-gradient(135deg, #f8f9ff 0%, #f5f7ff 100%);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #e8ebff;
}

.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
}

.detail-label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 13px 28px;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
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

  .form-card {
    padding: 25px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
