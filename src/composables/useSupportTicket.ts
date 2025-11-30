import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupportTicketStore } from '@/stores/support/supportTicketStore'
import { storeToRefs } from 'pinia'
import type { TicketStatus } from '@/interfaces/support'

export function useSupportTicket() {
  const store = useSupportTicketStore()
  const router = useRouter()

  // Get reactive refs from store
  const {
    tickets,
    currentTicket,
    currentBookingDetail,
    isLoading,
    error,
    validationResult,
    createTicketForm,
    openTickets,
    inProgressTickets,
    closedTickets,
    sortedMessages,
    sortedProgressHistory,
  } = storeToRefs(store)

  // Local state untuk forms
  const replyMessage = ref('')
  const progressText = ref('')
  const progressRole = ref('Admin Support')
  const selectedStatus = ref<TicketStatus | null>(null)

  // Status options - sesuai dengan backend
  const statusOptions = [
    { value: 'Open', label: 'Open', color: 'blue' },
    { value: 'In Progress', label: 'In Progress', color: 'yellow' },
    { value: 'Closed', label: 'Closed', color: 'green' },
  ]

  // Role options untuk progress
  const roleOptions = [
    { value: 'Admin Support', label: 'Admin Support' },
    { value: 'Flight Airline', label: 'Flight Airline' },
    { value: 'System', label: 'System' },
  ]

  // Helper untuk format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Helper untuk format relative time
  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    return formatDate(dateString)
  }

  // Get status color class
  const getStatusColor = (status: TicketStatus | string): string => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Closed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Navigate to ticket detail
  const goToTicketDetail = (ticketId: string) => {
    router.push({ name: 'ticket-detail', params: { id: ticketId } })
  }

  // Navigate to ticket list
  const goToTicketList = () => {
    router.push({ name: 'ticket-list' })
  }

  // Navigate to create ticket
  const goToCreateTicket = () => {
    store.resetCreateForm()
    router.push({ name: 'ticket-create' })
  }

  // Handle submit reply
  const submitReply = async (ticketId: string, senderName: string) => {
    if (!replyMessage.value.trim()) return false

    const success = await store.replyToTicket(ticketId, replyMessage.value, senderName)
    if (success) {
      replyMessage.value = ''
    }
    return success
  }

  // Handle add progress
  const submitProgress = async (ticketId: string) => {
    if (!progressText.value.trim()) return false

    const success = await store.addProgress(ticketId, progressText.value, progressRole.value)
    if (success) {
      progressText.value = ''
    }
    return success
  }

  // Handle update status
  const submitStatusUpdate = async (ticketId: string) => {
    if (!selectedStatus.value) return false

    const success = await store.updateTicketStatus(ticketId, selectedStatus.value)
    if (success) {
      selectedStatus.value = null
    }
    return success
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
    replyMessage,
    progressText,
    progressRole,
    selectedStatus,

    // Computed
    openTickets,
    inProgressTickets,
    closedTickets,
    sortedMessages,
    sortedProgressHistory,

    // Options
    statusOptions,
    roleOptions,

    // Helpers
    formatDate,
    formatRelativeTime,
    getStatusColor,

    // Navigation
    goToTicketDetail,
    goToTicketList,
    goToCreateTicket,

    // Actions
    submitReply,
    submitProgress,
    submitStatusUpdate,

    // Store actions (expose for direct use)
    clearError: store.clearError,
    resetCreateForm: store.resetCreateForm,
    validateBookingId: store.validateBookingId,
    createTicket: store.createTicket,
    fetchAllTickets: store.fetchAllTickets,
    fetchTicketsByStatus: store.fetchTicketsByStatus,
    fetchTicketDetail: store.fetchTicketDetail,
    fetchBookingDetail: store.fetchBookingDetail,
    updateTicketStatus: store.updateTicketStatus,
    previousStep: store.previousStep,
  }
}
