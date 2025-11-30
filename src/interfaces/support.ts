// ==================== ENUMS ====================

// Ticket Status - sesuai dengan backend
export type TicketStatus = 'Open' | 'In Progress' | 'Closed'

// ==================== BOOKING DETAIL ====================

// Sesuai dengan BookingDetailDTO di backend (SIMPLIFIED)
export interface BookingDetailDTO {
  bookingIdString: string
  contactEmail: string
  contactPhone: string
  displayTitle: string
  displaySubtitle: string
}

// ==================== TICKET MESSAGE ====================

// Sesuai dengan TicketMessageResponseDTO di backend
export interface TicketMessage {
  messageId: string
  ticketId: string
  senderName: string
  messageBody: string
  createdAt: string
}

// ==================== SUPPORT PROGRESS ====================

// Sesuai dengan SupportProgressResponseDTO di backend
export interface SupportProgress {
  progressId: string
  supportTicketId: string
  text: string
  role: string
  createdAt: string
}

// ==================== BOOKING INFO ====================

// Sesuai dengan SupportTicketResponseDTO.BookingInfoDTO
export interface BookingInfo {
  bookingId: string
  displayTitle: string
  displaySubtitle: string
  statusText: string
  contactEmail: string
  contactPhone: string
}

// ==================== SUPPORT TICKET ====================

// Sesuai dengan SupportTicketResponseDTO di backend
export interface SupportTicket {
  ticketId: string
  subject: string
  status: TicketStatus
  externalServiceSource: string
  externalBookingId: string
  createdAt: string
  updatedAt: string

  // Optional - included in detail view
  bookingInfo?: BookingInfo
  messages?: TicketMessage[]
  progressList?: SupportProgress[]
  messageCount?: number
  progressCount?: number
}

// ==================== REQUEST DTOs ====================

// Request untuk create ticket - sesuai SupportTicketRequestDTO
export interface CreateTicketRequest {
  bookingId: string
  subject: string
  initialMessage: string
}

// Request untuk validate booking - hanya perlu bookingId
export interface ValidateBookingRequest {
  bookingId: string
}

// Response untuk validate booking
export interface ValidateBookingResponse {
  valid: boolean
  bookingId?: string
  displayTitle?: string
  displaySubtitle?: string
  status?: string
  contactEmail?: string
  contactPhone?: string
  flightNumber?: string
  passengerCount?: number
  totalPrice?: number
  error?: string
}

// Request untuk reply message
export interface ReplyMessageRequest {
  message: string
  senderName: string
}

// Request untuk update status
export interface UpdateStatusRequest {
  status: TicketStatus
}

// Request untuk add progress
export interface AddProgressRequest {
  text: string
  role: string
}

// ==================== LEGACY TYPES (untuk backward compatibility) ====================

// Alias untuk backward compatibility dengan code yang sudah ada
export type TicketListResponse = SupportTicket
export type TicketDetailResponse = SupportTicket
export type ExternalBookingDetail = BookingDetailDTO

// Legacy ServiceType - tidak digunakan lagi tapi masih diperlukan untuk type checking
export type ServiceType = 'FLIGHT' | 'HOTEL' | 'TRAVEL'

// Legacy AddMessageRequest - redirect ke ReplyMessageRequest
export interface AddMessageRequest {
  message: string
  senderType?: 'USER' | 'ADMIN'
  senderName: string
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
