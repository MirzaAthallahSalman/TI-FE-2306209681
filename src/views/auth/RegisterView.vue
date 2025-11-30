<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-icon">🛫</div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join Flight Management System today</p>
      </div>

      <!-- Success Alert -->
      <div v-if="showSuccess" class="alert alert-success">
        <span class="alert-icon">✅</span>
        Registrasi berhasil! Redirecting...
      </div>

      <!-- Error Alert -->
      <div v-if="authStore.error" class="alert alert-error">
        <span class="alert-icon">⚠️</span>
        <span>{{ authStore.error }}</span>
        <button @click="authStore.clearError()" class="alert-close">✕</button>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">👤</span>
            Username
          </label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="Choose a username"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📝</span>
            Nama Lengkap
          </label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📧</span>
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔒</span>
              Password
            </label>
            <div class="password-input-wrapper">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Create password"
                required
                minlength="6"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔐</span>
              Confirm Password
            </label>
            <div class="password-input-wrapper">
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Password Match Indicator -->
        <div v-if="form.password && form.confirmPassword" class="password-match">
          <span v-if="!passwordMismatch" class="match-success">✅ Passwords match</span>
          <span v-else class="match-error">❌ Passwords don't match</span>
        </div>

        <!-- Gender Selection -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">👥</span>
            Gender
          </label>
          <div class="gender-options">
            <label class="gender-option">
              <input type="radio" v-model="form.gender" value="MALE" />
              <span class="gender-label">👨 Male</span>
            </label>
            <label class="gender-option">
              <input type="radio" v-model="form.gender" value="FEMALE" />
              <span class="gender-label">👩 Female</span>
            </label>
          </div>
        </div>

        <!-- Role Selection -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🎭</span>
            Pilih Role
          </label>
          <select v-model="form.role" class="form-input form-select" required>
            <option value="" disabled>Pilih role Anda</option>
            <option v-for="role in REGISTRABLE_ROLES" :key="role" :value="role">
              {{ ROLE_DISPLAY_NAMES[role] }}
            </option>
          </select>
          <p v-if="form.role" class="role-description">
            {{ ROLE_DESCRIPTIONS[form.role] }}
          </p>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="authStore.isLoading || passwordMismatch"
        >
          <span v-if="authStore.isLoading" class="btn-spinner"></span>
          {{ authStore.isLoading ? 'Creating Account...' : '🚀 Create Account' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="auth-footer">
        <p>Already have an account?</p>
        <router-link to="/login" class="link-login">
          Sign In →
        </router-link>
      </div>
    </div>

    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="plane plane-1">✈️</div>
      <div class="plane plane-2">🛫</div>
      <div class="plane plane-3">🛬</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'
import type { UserRole } from '@/interfaces/auth.interface'
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS, REGISTRABLE_ROLES } from '@/interfaces/auth.interface'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showSuccess = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '' as UserRole | '',
  gender: 'MALE' as 'MALE' | 'FEMALE',
})

const passwordMismatch = computed(() => {
  return form.value.password !== '' &&
         form.value.confirmPassword !== '' &&
         form.value.password !== form.value.confirmPassword
})

onMounted(() => {
  // If already authenticated, redirect based on role
  if (authStore.isAuthenticated) {
    router.push(authStore.getRedirectPath())
  }
})

async function handleRegister() {
  if (passwordMismatch.value) {
    return
  }

  if (!form.value.role) {
    authStore.error = 'Silakan pilih role'
    return
  }

  const success = await authStore.register({
    username: form.value.username,
    name: form.value.name,
    email: form.value.email,
    password: form.value.password,
    role: form.value.role as UserRole,
    gender: form.value.gender,
  })

  if (success) {
    showSuccess.value = true
    // Redirect after short delay
    setTimeout(() => {
      router.push(authStore.getRedirectPath())
    }, 1500)
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

.auth-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 10;
  animation: slideUp 0.5s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.auth-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.alert {
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.alert-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

.alert-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #059669;
}

.alert-icon {
  font-size: 1.2rem;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-icon {
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-select {
  cursor: pointer;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .form-input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.password-toggle:hover {
  transform: translateY(-50%) scale(1.1);
}

.password-match {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.match-success {
  color: #059669;
}

.match-error {
  color: #dc2626;
}

.gender-options {
  display: flex;
  gap: 20px;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.3s;
}

.gender-option:has(input:checked) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.gender-option input {
  display: none;
}

.gender-label {
  font-size: 0.95rem;
  color: #374151;
}

.role-description {
  font-size: 0.85rem;
  color: #6b7280;
  font-style: italic;
  margin-top: 5px;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: 25px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.auth-footer p {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.link-login {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.link-login:hover {
  color: #764ba2;
}

/* Background decorations */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.plane {
  position: absolute;
  font-size: 3rem;
  opacity: 0.1;
  animation: flyAround 20s linear infinite;
}

.plane-1 {
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.plane-2 {
  top: 50%;
  left: -10%;
  animation-delay: -7s;
}

.plane-3 {
  top: 80%;
  left: -10%;
  animation-delay: -14s;
}

@keyframes flyAround {
  0% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  100% {
    transform: translateX(120vw) translateY(-20vh) rotate(15deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: 30px 25px;
  }

  .auth-title {
    font-size: 1.75rem;
  }

  .auth-icon {
    font-size: 3rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .gender-options {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
