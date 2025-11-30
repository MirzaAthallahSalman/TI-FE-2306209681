<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <div class="auth-icon">✈️</div>
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to your Flight Management account</p>
      </div>

      <!-- Error Alert -->
      <div v-if="authStore.error" class="alert alert-error">
        <span class="alert-icon">⚠️</span>
        <span>{{ authStore.error }}</span>
        <button @click="authStore.clearError()" class="alert-close">✕</button>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">👤</span>
            Username
          </label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            required
          />
        </div>

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
              placeholder="Enter your password"
              required
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

        <button type="submit" class="btn btn-primary" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading" class="btn-spinner"></span>
          {{ authStore.isLoading ? 'Signing in...' : '🚀 Sign In' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="auth-footer">
        <p>Don't have an account?</p>
        <router-link to="/register" class="link-register">
          Create Account →
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const showPassword = ref(false)

onMounted(() => {
  // If already authenticated, redirect based on role
  if (authStore.isAuthenticated) {
    router.push(authStore.getRedirectPath())
  }
})

async function handleLogin() {
  const success = await authStore.login({
    username: form.value.username,
    password: form.value.password,
  })

  if (success) {
    // Redirect based on role
    const redirect = route.query.redirect as string
    if (redirect) {
      router.push(redirect)
    } else {
      router.push(authStore.getRedirectPath())
    }
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
  max-width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 10;
  animation: slideUp 0.5s ease-out;
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
  margin-bottom: 35px;
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

.alert-icon {
  font-size: 1.2rem;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 5px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
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

.btn {
  padding: 16px 24px;
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
  margin-top: 30px;
  text-align: center;
  padding-top: 25px;
  border-top: 1px solid #e5e7eb;
}

.auth-footer p {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.link-register {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.link-register:hover {
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
}
</style>
