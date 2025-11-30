import axios from 'axios'

// Flight BE API URL
const FLIGHT_API_URL = import.meta.env.VITE_FLIGHT_API_URL || 'http://2306209681-be.hafizmuh.site'

// Create axios instance for Flight API
const flightApi = axios.create({
  baseURL: `${FLIGHT_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
flightApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
flightApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Authentication error:', error.response?.status)
      // Optionally redirect to login or handle unauthorized access
    }
    return Promise.reject(error)
  }
)

export { flightApi }
export default flightApi
