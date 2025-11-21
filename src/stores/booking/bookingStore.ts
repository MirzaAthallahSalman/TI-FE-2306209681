/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type {
  BookingRequest,
  BookingResponse,
  BookingUpdateForm,
  UpdateBooking,
  TwoWayBookingRequest,
  TwoWayBookingResponse,
  BookingStatistics
} from '@/interfaces/booking.interface'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<BookingResponse[]>([])
  const currentBooking = ref<BookingResponse | null>(null)
  const currentBookingForm = ref<BookingUpdateForm | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ===== CREATE BOOKING (One-Way) =====
  const createBooking = async (request: BookingRequest): Promise<BookingResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post<BookingResponse>(
        `${API_URL}/bookings`,
        request
      )
      await fetchBookings() // Refresh list
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to create booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== CREATE TWO-WAY BOOKING (Round Trip) =====
  const createTwoWayBooking = async (
    request: TwoWayBookingRequest
  ): Promise<TwoWayBookingResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post<TwoWayBookingResponse>(
        `${API_URL}/bookings/two-way`,
        request
      )
      await fetchBookings() // Refresh list
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to create two-way booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== GET ALL BOOKINGS =====
  const fetchBookings = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<BookingResponse[]>(`${API_URL}/bookings`)
      bookings.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch bookings'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== GET BOOKING BY ID =====
  const getBookingById = async (id: string): Promise<BookingResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<BookingResponse>(
        `${API_URL}/bookings/${id}`
      )
      currentBooking.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== GET BOOKING FOR UPDATE =====
  const getBookingForUpdate = async (id: string): Promise<BookingUpdateForm> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<BookingUpdateForm>(
        `${API_URL}/bookings/${id}/update`
      )
      currentBookingForm.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch booking for update'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== UPDATE BOOKING =====
  const updateBooking = async (
    id: string,
    request: UpdateBooking
  ): Promise<BookingResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put<BookingResponse>(
        `${API_URL}/bookings/${id}`,
        request
      )
      await fetchBookings() // Refresh list
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to update booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== CANCEL BOOKING =====
  const cancelBooking = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`${API_URL}/bookings/${id}`)
      await fetchBookings() // Refresh list
    } catch (err: any) {
      error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to cancel booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== GET BOOKING STATISTICS =====
  const getBookingStatistics = async (
    month: number,
    year: number
  ): Promise<BookingStatistics> => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<BookingStatistics>(
        `${API_URL}/bookings/statistics`,
        {
          params: { month, year }
        }
      )
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch booking statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== HELPER: Clear current booking =====
  const clearCurrentBooking = () => {
    currentBooking.value = null
    currentBookingForm.value = null
  }

  // ===== HELPER: Get booking status text =====
  const getBookingStatusText = (status: number): string => {
    const statusMap: Record<number, string> = {
      1: 'Unpaid',
      2: 'Paid',
      3: 'Cancelled',
      4: 'Rescheduled'
    }
    return statusMap[status] || 'Unknown'
  }

  // ===== HELPER: Get booking status badge class =====
  const getBookingStatusBadgeClass = (status: number): string => {
    const badgeMap: Record<number, string> = {
      1: 'bg-warning',      // Unpaid - yellow
      2: 'bg-success',      // Paid - green
      3: 'bg-danger',       // Cancelled - red
      4: 'bg-info'          // Rescheduled - cyan
    }
    return badgeMap[status] || 'bg-secondary'
  }

  // ===== HELPER: Get gender text =====
  const getGenderText = (gender: number): string => {
    const genderMap: Record<number, string> = {
      1: 'Male',
      2: 'Female',
      3: 'Other'
    }
    return genderMap[gender] || 'Unknown'
  }

  // ===== HELPER: Format price =====
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  // ===== HELPER: Format date =====
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long'
    }).format(date)
  }

  // ===== HELPER: Format datetime =====
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  }

  return {
    // State
    bookings,
    currentBooking,
    currentBookingForm,
    loading,
    error,

    // Actions
    createBooking,
    createTwoWayBooking,
    fetchBookings,
    getBookingById,
    getBookingForUpdate,
    updateBooking,
    cancelBooking,
    getBookingStatistics,

    // Helpers
    clearCurrentBooking,
    getBookingStatusText,
    getBookingStatusBadgeClass,
    getGenderText,
    formatPrice,
    formatDate,
    formatDateTime
  }
})
