/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type {
  SupportTicket,
  TicketMessage,
  SupportProgress,
  CreateTicketRequest,
  ValidateBookingResponse,
  ReplyMessageRequest,
  AddProgressRequest,
  TicketStatus,
  BookingDetailDTO,
} from '@/interfaces/support'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://2306209681-be.hafizmuh.site'

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useSupportTicketStore = defineStore('supportTicket', () => {
  // ==================== STATE ====================
  const tickets = ref<SupportTicket[]>([])
  const currentTicket = ref<SupportTicket | null>(null)
  const currentBookingDetail = ref<BookingDetailDTO | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const validationResult = ref<ValidateBookingResponse | null>(null)

  // Form state untuk create ticket (simplified - 2 steps only)
  const createTicketForm = ref<{
    step: number
    bookingId: string
    isBookingValid: boolean
    subject: string
    initialMessage: string
  }>({
    step: 1,
    bookingId: '',
    isBookingValid: false,
    subject: '',
    initialMessage: '',
  })

  // ==================== GETTERS ====================
  const openTickets = computed(() => tickets.value.filter((t) => t.status === 'Open'))

  const inProgressTickets = computed(() => tickets.value.filter((t) => t.status === 'In Progress'))

  const closedTickets = computed(() => tickets.value.filter((t) => t.status === 'Closed'))

  const sortedMessages = computed(() => {
    if (!currentTicket.value?.messages) return []
    return [...currentTicket.value.messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  })

  const sortedProgressHistory = computed(() => {
    if (!currentTicket.value?.progressList) return []
    return [...currentTicket.value.progressList].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  })

  // ==================== ACTIONS ====================

  // Reset error state
  function clearError() {
    error.value = null
  }

  // Reset create ticket form
  function resetCreateForm() {
    createTicketForm.value = {
      step: 1,
      bookingId: '',
      isBookingValid: false,
      subject: '',
      initialMessage: '',
    }
    validationResult.value = null
  }

  // Validate Booking ID (step 1) - simplified, no serviceType needed
  async function validateBookingId(bookingId: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    validationResult.value = null

    try {
      const response = await axios.post<ValidateBookingResponse>(
        `${API_BASE_URL}/api/support-tickets/validate-booking`,
        { bookingId },
        { headers: getAuthHeaders() }
      )

      if (response.data.valid) {
        validationResult.value = response.data
        createTicketForm.value.bookingId = bookingId
        createTicketForm.value.isBookingValid = true
        createTicketForm.value.step = 2
        return true
      } else {
        validationResult.value = {
          valid: false,
          error: response.data.error || 'Booking ID tidak valid',
        }
        error.value = response.data.error || 'Booking ID tidak valid'
        createTicketForm.value.isBookingValid = false
        return false
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Gagal memvalidasi Booking ID'
      validationResult.value = {
        valid: false,
        error: errorMessage,
      }
      error.value = errorMessage
      createTicketForm.value.isBookingValid = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Create Ticket (step 2 - final)
  async function createTicket(): Promise<string | null> {
    if (!createTicketForm.value.isBookingValid) {
      error.value = 'Booking ID belum divalidasi'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const request: CreateTicketRequest = {
        bookingId: createTicketForm.value.bookingId,
        subject: createTicketForm.value.subject,
        initialMessage: createTicketForm.value.initialMessage,
      }

      const response = await axios.post<SupportTicket>(
        `${API_BASE_URL}/api/support-tickets`,
        request,
        { headers: getAuthHeaders() }
      )

      if (response.data) {
        // Reset form setelah berhasil
        resetCreateForm()
        // Refresh list
        await fetchAllTickets()
        return response.data.ticketId
      } else {
        error.value = 'Gagal membuat ticket'
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal membuat ticket'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Fetch all tickets
  async function fetchAllTickets() {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get<SupportTicket[]>(`${API_BASE_URL}/api/support-tickets`, {
        headers: getAuthHeaders()
      })

      if (response.data) {
        tickets.value = response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal mengambil daftar ticket'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch tickets by status
  async function fetchTicketsByStatus(status: TicketStatus) {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get<SupportTicket[]>(
        `${API_BASE_URL}/api/support-tickets/status/${status}`,
        { headers: getAuthHeaders() }
      )

      if (response.data) {
        tickets.value = response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal mengambil daftar ticket'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch ticket detail
  async function fetchTicketDetail(ticketId: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get<SupportTicket>(
        `${API_BASE_URL}/api/support-tickets/${ticketId}`,
        { headers: getAuthHeaders() }
      )

      if (response.data) {
        currentTicket.value = response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal mengambil detail ticket'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch booking detail for ticket (untuk admin melihat data booking lengkap)
  async function fetchBookingDetail(ticketId: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get<BookingDetailDTO>(
        `${API_BASE_URL}/api/support-tickets/${ticketId}/booking-detail`,
        { headers: getAuthHeaders() }
      )

      if (response.data) {
        currentBookingDetail.value = response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal mengambil detail booking'
    } finally {
      isLoading.value = false
    }
  }

  // Reply to ticket
  async function replyToTicket(
    ticketId: string,
    message: string,
    senderName: string,
  ): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const request: ReplyMessageRequest = {
        message,
        senderName,
      }

      const response = await axios.post<TicketMessage>(
        `${API_BASE_URL}/api/support-tickets/${ticketId}/reply`,
        request,
        { headers: getAuthHeaders() }
      )

      if (response.data) {
        // Refresh ticket detail untuk mendapatkan message baru
        await fetchTicketDetail(ticketId)
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal menambah pesan'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Update ticket status
  async function updateTicketStatus(ticketId: string, newStatus: TicketStatus): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.patch<SupportTicket>(
        `${API_BASE_URL}/api/support-tickets/${ticketId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      )

      if (response.data) {
        currentTicket.value = response.data
        // Refresh list juga
        await fetchAllTickets()
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal mengubah status'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Add progress to ticket
  async function addProgress(ticketId: string, text: string, role: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const request: AddProgressRequest = {
        text,
        role,
      }

      const response = await axios.post<SupportProgress>(
        `${API_BASE_URL}/api/support-tickets/${ticketId}/progress`,
        request,
        { headers: getAuthHeaders() }
      )

      if (response.data) {
        // Refresh ticket detail
        await fetchTicketDetail(ticketId)
        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal menambah progress'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Go to previous step in create form
  function previousStep() {
    if (createTicketForm.value.step > 1) {
      createTicketForm.value.step--
      if (createTicketForm.value.step === 1) {
        createTicketForm.value.isBookingValid = false
        validationResult.value = null
      }
    }
  }

  // Delete ticket
  async function deleteTicket(ticketId: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await axios.delete(
        `${API_BASE_URL}/api/support-tickets/${ticketId}`,
        { headers: getAuthHeaders() }
      )

      // Refresh list
      await fetchAllTickets()
      currentTicket.value = null
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal menghapus ticket'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Delete progress
  async function deleteProgress(ticketId: string, progressId: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await axios.delete(
        `${API_BASE_URL}/api/support-tickets/${ticketId}/progress/${progressId}`,
        { headers: getAuthHeaders() }
      )

      // Refresh ticket detail
      await fetchTicketDetail(ticketId)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Gagal menghapus progress'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    tickets,
    currentTicket,
    currentBookingDetail,
    isLoading,
    error,
    validationResult,
    createTicketForm,

    // Getters
    openTickets,
    inProgressTickets,
    closedTickets,
    sortedMessages,
    sortedProgressHistory,

    // Actions
    clearError,
    resetCreateForm,
    validateBookingId,
    createTicket,
    fetchAllTickets,
    fetchTicketsByStatus,
    fetchTicketDetail,
    fetchBookingDetail,
    replyToTicket,
    updateTicketStatus,
    addProgress,
    previousStep,
    deleteTicket,
    deleteProgress,
  }
})
