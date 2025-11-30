<template>
  <div class="support-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">🎫 Support Center</div>
      <div class="nav-links">
        <router-link v-if="authStore.canAccessHome" to="/">Home</router-link>
        <router-link v-if="authStore.canAccessAirplanes" to="/airplanes">Airplanes</router-link>
        <router-link to="/flights">Flights</router-link>
        <router-link to="/bookings">Bookings</router-link>
        <router-link v-if="authStore.canAccessStatistics" to="/statistics">📊 Statistics</router-link>
        <router-link to="/tickets" class="active">Support Tickets</router-link>
        <div class="user-section" v-if="authStore.isAuthenticated">
          <span class="user-role">{{ authStore.user?.role }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-icon">🎫</div>
          <div>
            <div class="header-title">Buat Ticket Support</div>
            <div class="header-subtitle">
              Sampaikan keluhan atau pertanyaan Anda terkait booking
            </div>
          </div>
        </div>
        <router-link to="/tickets" class="btn-back"> ← Kembali ke Daftar </router-link>
      </div>

      <!-- Progress Steps -->
      <div class="progress-section">
        <div class="progress-steps">
          <div v-for="(step, index) in steps" :key="index" class="progress-step">
            <div
              :class="[
                'step-circle',
                currentStep > index + 1 ? 'completed' : '',
                currentStep === index + 1 ? 'active' : '',
              ]"
            >
              <span v-if="currentStep > index + 1">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span :class="['step-label', currentStep >= index + 1 ? 'active' : '']">
              {{ step }}
            </span>
            <div
              v-if="index < steps.length - 1"
              :class="['step-line', currentStep > index + 1 ? 'completed' : '']"
            />
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="error-alert">
        <span class="error-icon">⚠️</span>
        <div class="error-content">
          <p>{{ error }}</p>
        </div>
        <button @click="clearError" class="error-close">✕</button>
      </div>

      <!-- Step 1: Input Booking ID -->
      <div v-if="currentStep === 1" class="form-card">
        <div class="card-header">
          <div class="card-icon">🔍</div>
          <div>
            <h2 class="card-title">Masukkan Booking ID</h2>
            <p class="card-subtitle">Masukkan ID booking Anda untuk melanjutkan</p>
          </div>
        </div>

        <div class="card-body">
          <div class="form-group">
            <label class="form-label"> Booking ID <span class="required">*</span> </label>
            <div class="input-with-button">
              <input
                v-model="bookingIdInput"
                type="text"
                placeholder="Contoh: BOOK-001-101-2025-12-02-14:00:00"
                class="form-input"
                :disabled="isLoading"
                @keyup.enter="validateBooking"
              />
              <button
                @click="validateBooking"
                :disabled="isLoading || !bookingIdInput.trim()"
                class="btn btn-primary"
              >
                <span v-if="isLoading" class="spinner-small">⟳</span>
                <span>{{ isLoading ? 'Validating...' : '🔍 Validasi' }}</span>
              </button>
            </div>
            <p class="form-hint">Format: Booking ID dari sistem (contoh: BOOK-001-101-2025-12-02-14:00:00)</p>
          </div>

          <!-- Validation Result -->
          <div
            v-if="validationResult"
            :class="['validation-result', validationResult.valid ? 'success' : 'error']"
          >
            <div class="validation-icon">
              {{ validationResult.valid ? '✓' : '✕' }}
            </div>
            <div class="validation-content">
              <p class="validation-title">
                {{
                  validationResult.valid
                    ? 'Booking ID Valid!'
                    : validationResult.error || 'Booking ID tidak valid'
                }}
              </p>
              <div v-if="validationResult.valid" class="validation-details">
                <p>
                  <strong>{{ validationResult.displayTitle }}</strong>
                </p>
                <p>{{ validationResult.displaySubtitle }}</p>
                <p v-if="validationResult.flightNumber">
                  ✈️ Flight: {{ validationResult.flightNumber }}
                </p>
                <p v-if="validationResult.contactEmail">
                  📧 Email: {{ validationResult.contactEmail }}
                </p>
                <p v-if="validationResult.status">📊 Status: {{ validationResult.status }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="card-footer">
          <button @click="goBack" class="btn btn-secondary">← Kembali</button>
        </div>
      </div>

      <!-- Step 2: Isi Detail Ticket -->
      <div v-if="currentStep === 2" class="form-card">
        <div class="card-header">
          <div class="card-icon">📝</div>
          <div>
            <h2 class="card-title">Detail Ticket</h2>
            <p class="card-subtitle">Jelaskan masalah atau pertanyaan Anda</p>
          </div>
        </div>

        <div class="card-body">
          <!-- Booking Info Summary -->
          <div v-if="validationResult?.valid" class="booking-summary">
            <div class="booking-summary-icon">✈️</div>
            <div class="booking-summary-content">
              <p class="booking-summary-title">{{ validationResult.displayTitle }}</p>
              <p class="booking-summary-subtitle">{{ validationResult.displaySubtitle }}</p>
              <p class="booking-summary-id">{{ createTicketForm.bookingId }}</p>
            </div>
          </div>

          <form @submit.prevent="submitTicket" class="form-content">
            <!-- Subject -->
            <div class="form-group">
              <label class="form-label"> Subject <span class="required">*</span> </label>
              <input
                v-model="createTicketForm.subject"
                type="text"
                required
                placeholder="Ringkasan masalah Anda (contoh: Gagal check-in online)"
                class="form-input"
              />
            </div>

            <!-- Message -->
            <div class="form-group">
              <label class="form-label"> Pesan <span class="required">*</span> </label>
              <textarea
                v-model="createTicketForm.initialMessage"
                required
                rows="5"
                placeholder="Jelaskan detail masalah atau pertanyaan Anda..."
                class="form-textarea"
              />
            </div>

            <!-- Navigation -->
            <div class="form-actions">
              <button type="button" @click="previousStep" class="btn btn-secondary">
                ← Kembali
              </button>
              <button type="submit" :disabled="isLoading || !isFormValid" class="btn btn-primary">
                <span v-if="isLoading" class="spinner-small">⟳</span>
                <span>{{ isLoading ? 'Mengirim...' : '📤 Kirim Ticket' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSupportTicket } from '@/composables/useSupportTicket'
import { useAuthStore } from '@/stores/auth/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Logout handler
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const {
  createTicketForm,
  isLoading,
  error,
  validationResult,
  clearError,
  validateBookingId,
  createTicket,
  previousStep,
} = useSupportTicket()

// Local state
const bookingIdInput = ref('')

// Steps - simplified to 2 steps only
const steps = ['Validasi Booking', 'Detail Ticket']

// Computed
const currentStep = computed(() => createTicketForm.value.step)

const isFormValid = computed(() => {
  return (
    createTicketForm.value.subject.trim() !== '' &&
    createTicketForm.value.initialMessage.trim() !== ''
  )
})

// Methods
const goBack = () => {
  router.back()
}

const validateBooking = async () => {
  if (!bookingIdInput.value.trim()) return
  await validateBookingId(bookingIdInput.value.trim())
}

const submitTicket = async () => {
  const ticketId = await createTicket()
  if (ticketId) {
    router.push({ name: 'ticket-list' })
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.support-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.nav-brand {
  color: white;
  font-size: 1.1rem;
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

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 15px;
  padding-left: 15px;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.user-role {
  color: white;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #ef4444;
  transform: translateY(-1px);
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

.header-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  margin-top: 4px;
}

.btn-back {
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

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
}

/* Progress Steps */
.progress-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-step {
  display: flex;
  align-items: center;
}

.step-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.step-circle.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.step-circle.completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.step-label {
  margin-left: 12px;
  font-weight: 600;
  color: #999;
  font-size: 0.95rem;
}

.step-label.active {
  color: #333;
}

.step-line {
  width: 80px;
  height: 3px;
  background: #e0e0e0;
  margin: 0 20px;
  border-radius: 2px;
}

.step-line.completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

/* Error Alert */
.error-alert {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.error-icon {
  font-size: 1.5rem;
}

.error-content {
  flex: 1;
  font-weight: 500;
}

.error-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.card-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #666;
}

.card-body {
  padding: 30px;
}

.card-footer {
  padding: 20px 30px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-start;
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #ff6b6b;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: none;
}

.form-hint {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #999;
}

.input-with-button {
  display: flex;
  gap: 12px;
}

.input-with-button .form-input {
  flex: 1;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e8e8e8;
}

/* Validation Result */
.validation-result {
  margin-top: 20px;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.validation-result.success {
  background: linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%);
  border: 2px solid #11998e;
}

.validation-result.error {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%);
  border: 2px solid #ff6b6b;
}

.validation-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
}

.validation-result.success .validation-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.validation-result.error .validation-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.validation-title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 8px;
}

.validation-result.success .validation-title {
  color: #11998e;
}

.validation-result.error .validation-title {
  color: #ff6b6b;
}

.validation-details {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
}

/* Booking Summary */
.booking-summary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.booking-summary-icon {
  font-size: 2.5rem;
}

.booking-summary-title {
  font-weight: 700;
  color: #333;
  font-size: 1.1rem;
}

.booking-summary-subtitle {
  color: #667eea;
  font-size: 0.95rem;
  margin-top: 2px;
}

.booking-summary-id {
  font-family: monospace;
  font-size: 0.8rem;
  color: #999;
  margin-top: 8px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

/* Spinner */
.spinner-small {
  display: inline-block;
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

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .header-section {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .header-content {
    flex-direction: column;
  }

  .progress-steps {
    flex-direction: column;
    gap: 15px;
  }

  .step-line {
    display: none;
  }

  .input-with-button {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
