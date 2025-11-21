/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type {
  FlightResponse,
  FlightDetailResponse,
  FlightRequest,
  FlightUpdateRequest,
  FlightSearchParams,
  RoundTripParams
} from '@/interfaces/flight.interface'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const useFlightStore = defineStore('flight', () => {
  const flights = ref<FlightResponse[]>([])
  const currentFlight = ref<FlightDetailResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ===== CREATE FLIGHT =====
  const createFlight = async (request: FlightRequest): Promise<FlightResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post<FlightResponse>(
        `${API_URL}/flights`,
        request
      )
      await fetchFlights() // Refresh list
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to create flight'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== GET ALL FLIGHTS =====
  const fetchFlights = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<FlightResponse[]>(`${API_URL}/flights`)
      flights.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch flights'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== GET FLIGHT DETAIL (untuk detail page) =====
  const getFlightDetail = async (id: string): Promise<FlightDetailResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<FlightDetailResponse>(
        `${API_URL}/flights/${id}`
      )
      currentFlight.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch flight detail'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== GET FLIGHT FOR UPDATE (untuk form update) =====
  const getFlightForUpdate = async (id: string): Promise<FlightDetailResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<FlightDetailResponse>(
        `${API_URL}/flights/${id}/update`
      )
      currentFlight.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch flight for update'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== SEARCH FLIGHTS =====
  const searchFlights = async (params: FlightSearchParams) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<FlightResponse[]>(
        `${API_URL}/flights/search`,
        { params }
      )
      flights.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search flights'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== ROUND TRIP SEARCH =====
  const searchRoundTrip = async (params: RoundTripParams) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<FlightResponse[]>(
        `${API_URL}/flights/round-trip`,
        { params }
      )
      flights.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search round trip flights'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== UPDATE FLIGHT =====
  const updateFlight = async (
    id: string,
    request: FlightUpdateRequest
  ): Promise<FlightResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put<FlightResponse>(
        `${API_URL}/flights/${id}/update`,
        request
      )
      await fetchFlights() // Refresh list
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to update flight'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== CANCEL FLIGHT (DELETE) =====
  const cancelFlight = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`${API_URL}/flights/${id}`)
      await fetchFlights() // Refresh list
    } catch (err: any) {
      error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to cancel flight'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== HELPER: Clear current flight =====
  const clearCurrentFlight = () => {
    currentFlight.value = null
  }

  // ===== HELPER: Get status text =====
  const getStatusText = (status: number): string => {
    const statusMap: Record<number, string> = {
      1: 'Scheduled',
      2: 'In Flight',
      3: 'Finished',
      4: 'Delayed',
      5: 'Cancelled'
    }
    return statusMap[status] || 'Unknown'
  }

  // ===== HELPER: Get status badge class =====
  const getStatusBadgeClass = (status: number): string => {
    const badgeMap: Record<number, string> = {
      1: 'bg-primary',      // Scheduled - blue
      2: 'bg-success',      // In Flight - green
      3: 'bg-secondary',    // Finished - gray
      4: 'bg-warning',      // Delayed - yellow
      5: 'bg-danger'        // Cancelled - red
    }
    return badgeMap[status] || 'bg-secondary'
  }

  // ===== HELPER: Get class name =====
  const getClassName = (classType: number): string => {
    const classMap: Record<number, string> = {
      1: 'Economy',
      2: 'Business',
      3: 'First'
    }
    return classMap[classType] || 'Unknown'
  }

  // ===== HELPER: Get class badge class =====
  const getClassBadgeClass = (classType: number): string => {
    const badgeMap: Record<number, string> = {
      1: 'bg-info',      // Economy - cyan
      2: 'bg-warning',   // Business - yellow
      3: 'bg-danger'     // First - red
    }
    return badgeMap[classType] || 'bg-secondary'
  }

  return {
    // State
    flights,
    currentFlight,
    loading,
    error,

    // Actions
    createFlight,
    fetchFlights,
    getFlightDetail,
    getFlightForUpdate,
    searchFlights,
    searchRoundTrip,
    updateFlight,
    cancelFlight,

    // Helpers
    clearCurrentFlight,
    getStatusText,
    getStatusBadgeClass,
    getClassName,
    getClassBadgeClass
  }
})
