/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { User, UserRole, LoginRequest, RegisterRequest, ProfileServiceResponse, AuthResponseData } from '@/interfaces/auth.interface'

// Profile service URL (authentication service)
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://2306223206-be.hafizmuh.site'

// Local storage keys
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  // ==================== STATE ====================
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const userRole = computed(() => user.value?.role || null)

  const isCustomer = computed(() => user.value?.role === 'CUSTOMER')

  const isSuperAdmin = computed(() => user.value?.role === 'SUPERADMIN')

  const isVendor = computed(() => {
    const vendorRoles: UserRole[] = [
      'FLIGHT_AIRLINE',
      'ACCOMMODATION_OWNER',
      'RENTAL_VENDOR',
      'INSURANCE_PROVIDER',
      'TOUR_PACKAGE_VENDOR'
    ]
    return user.value?.role ? vendorRoles.includes(user.value.role) : false
  })

  // Check if user is Flight Airline
  const isFlightAirline = computed(() => user.value?.role === 'FLIGHT_AIRLINE')

  // Check if user can perform certain actions on support tickets
  const canCreateTicket = computed(() => isCustomer.value)

  const canUpdateTicketStatus = computed(() => isSuperAdmin.value || isVendor.value)

  const canDeleteTicket = computed(() => isCustomer.value || isSuperAdmin.value)

  const canManageProgress = computed(() => isSuperAdmin.value || isVendor.value)

  // RBAC for navigation and access control
  const canAccessHome = computed(() => !isCustomer.value)
  const canAccessAirplanes = computed(() => !isCustomer.value)
  const canAccessStatistics = computed(() => isSuperAdmin.value || isFlightAirline.value)
  const canManageBookings = computed(() => !isFlightAirline.value) // FLIGHT_AIRLINE can only view, not manage
  const canViewTicketDetails = computed(() => !isCustomer.value) // Customer cannot see contact info, username etc
  const canAddTicketProgress = computed(() => !isCustomer.value) // Customer cannot add progress
  const canCreateFlight = computed(() => isSuperAdmin.value || isFlightAirline.value) // Only SUPERADMIN and FLIGHT_AIRLINE can create flights
  const canUpdateFlight = computed(() => isSuperAdmin.value || isFlightAirline.value) // Only SUPERADMIN and FLIGHT_AIRLINE can update flights

  // ==================== ACTIONS ====================

  // Initialize auth from localStorage
  function initAuth() {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      } catch {
        // Invalid stored user, clear storage
        clearAuth()
      }
    }
  }

  // Clear auth data
  function clearAuth() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete axios.defaults.headers.common['Authorization']
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  // Helper to convert auth response to User
  function authResponseToUser(data: AuthResponseData): User {
    return {
      id: data.userId,
      username: data.username,
      email: data.email,
      role: data.role as UserRole,
    }
  }

  // Login
  async function login(credentials: LoginRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post<ProfileServiceResponse<AuthResponseData>>(
        `${AUTH_API_URL}/api/auth/login`,
        credentials
      )

      // Profile service wraps response in BaseResponse with data field
      if (response.data && response.data.data && response.data.data.token) {
        const authData = response.data.data
        token.value = authData.token
        user.value = authResponseToUser(authData)

        // Save to localStorage
        localStorage.setItem(TOKEN_KEY, authData.token)
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`

        return true
      } else {
        error.value = response.data?.message || 'Login gagal: Response tidak valid'
        return false
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Login gagal'
      error.value = errorMessage
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Register
  async function register(data: RegisterRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post<ProfileServiceResponse<AuthResponseData>>(
        `${AUTH_API_URL}/api/auth/register`,
        data
      )

      // Profile service wraps response in BaseResponse with data field
      if (response.data && response.data.data && response.data.data.token) {
        const authData = response.data.data

        // Auto login after register
        token.value = authData.token
        user.value = authResponseToUser(authData)

        // Save to localStorage
        localStorage.setItem(TOKEN_KEY, authData.token)
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`

        return true
      } else if (response.data && response.data.message) {
        // Registration successful but check if it's an error
        if (response.data.status >= 400) {
          error.value = response.data.message
          return false
        }
        return true
      } else {
        error.value = 'Registrasi gagal: Response tidak valid'
        return false
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Registrasi gagal'
      error.value = errorMessage
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  function logout() {
    clearAuth()
  }

  // Validate token with profile service
  async function validateToken(): Promise<boolean> {
    if (!token.value) {
      return false
    }

    isLoading.value = true

    try {
      const response = await axios.post<ProfileServiceResponse<AuthResponseData>>(
        `${AUTH_API_URL}/api/auth/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )

      if (response.data && response.data.status === 200 && response.data.data) {
        // Token is valid, update user
        user.value = authResponseToUser(response.data.data)
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))
        return true
      } else {
        // Token is invalid
        clearAuth()
        return false
      }
    } catch {
      // Token validation failed
      clearAuth()
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Check if user has specific role
  function hasRole(role: UserRole): boolean {
    return user.value?.role === role
  }

  // Check if user has any of the specified roles
  function hasAnyRole(roles: UserRole[]): boolean {
    return user.value?.role ? roles.includes(user.value.role) : false
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userRole,
    isCustomer,
    isSuperAdmin,
    isVendor,
    isFlightAirline,
    canCreateTicket,
    canUpdateTicketStatus,
    canDeleteTicket,
    canManageProgress,
    canAccessHome,
    canAccessAirplanes,
    canAccessStatistics,
    canManageBookings,
    canViewTicketDetails,
    canAddTicketProgress,
    canCreateFlight,
    canUpdateFlight,

    // Actions
    initAuth,
    clearAuth,
    clearError,
    login,
    register,
    logout,
    validateToken,
    hasRole,
    hasAnyRole,
    // Helper method to get redirect path based on role
    getRedirectPath: () => {
      if (isCustomer.value) {
        return '/flights'
      }
      return '/'
    },
  }
})
