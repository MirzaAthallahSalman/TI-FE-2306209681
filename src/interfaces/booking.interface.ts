// ===== Passenger DTOs =====
export interface PassengerSelection {
  passengerId: string // UUID
  seatCode: string
  passengerName?: string // Optional for display
  passengerGender?: string // Optional for display
}

export interface PassengerInfo {
  passengerId: string // UUID
  fullName: string
  birthDate: string // LocalDate as ISO string (YYYY-MM-DD)
  gender: number // 1=Male, 2=Female, 3=Other
  genderText: string
  idPassport: string
  seatCodes: string[]
}

export interface PassengerDetail {
  passengerId: string // UUID
  fullName: string
  birthDate: string // LocalDate as ISO string
  gender: number
  genderText: string
  idPassport: string
  currentSeatCode: string | null
}

// ===== Seat Map =====
export interface SeatMap {
  seatCode: string
  isAvailable: boolean
  passengerName: string | null
}

// ===== Booking Request =====
export interface BookingRequest {
  flightId: string
  classFlightId: number
  contactEmail: string
  contactPhone: string
  passengerCount: number
  passengers: PassengerSelection[]
}

// ===== Booking Response =====
export interface BookingResponse {
  bookingId: string
  bookingCode: string
  flightId: string
  flightNumber: string
  classFlightId: number
  className: string
  contactEmail: string
  contactPhone: string
  passengerCount: number
  status: number // 1=Unpaid, 2=Paid, 3=Cancelled, 4=Rescheduled
  statusText: string
  totalPrice: number
  createdAt: string // ISO string

  // Flight Information
  originAirportCode: string
  originAirportName: string
  destinationAirportCode: string
  destinationAirportName: string
  departureTime: string // ISO string
  arrivalTime: string // ISO string

  // Passenger Information
  passengers: PassengerInfo[]
}

// ===== Booking Update Form =====
export interface BookingUpdateForm {
  bookingId: string
  bookingCode: string
  flightId: string
  flightNumber: string
  originAirportCode: string
  originAirportName: string
  destinationAirportCode: string
  destinationAirportName: string
  departureTime: string
  arrivalTime: string
  classFlightId: number
  className: string
  classPrice: number
  availableSeats: number
  contactEmail: string
  contactPhone: string
  passengerCount: number
  status: number
  statusText: string
  totalPrice: number
  passengers: PassengerDetail[]
}

// ===== Update Booking DTO =====
export interface PassengerUpdate {
  passengerId: string // UUID
  seatCode: string
  action: 'add' | 'remove' | 'update'
}

export interface UpdateBooking {
  contactEmail: string
  contactPhone: string
  passengers: PassengerUpdate[]
}

// ===== Two-Way (Round Trip) Booking =====
export interface PassengerFlightSelection {
  passengerId: string // UUID
  seatCode: string
}

export interface TwoWayBookingRequest {
  // Departure Flight
  departureFlightId: string
  departureClassFlightId: number

  // Return Flight
  returnFlightId: string
  returnClassFlightId: number

  // Shared Information
  contactEmail: string
  contactPhone: string
  passengerCount: number

  // Passenger & Seat Selection
  departurePassengers: PassengerFlightSelection[]
  returnPassengers: PassengerFlightSelection[]
}

export interface TwoWayBookingResponse {
  // Departure Booking
  departureBooking: BookingResponse
  departureBookingId: string

  // Return Booking
  returnBooking: BookingResponse
  returnBookingId: string

  // Summary
  totalPassengers: number
  totalPrice: number
  message: string
}

// ===== Booking Statistics =====
export interface FlightBookingStat {
  flightId: string
  flightNumber: string
  originAirportCode: string
  destinationAirportCode: string
  bookingCount: number
  revenue: number
}

export interface BookingStatistics {
  month: number
  year: number
  totalBookings: number
  totalRevenue: number
  topFlightId: string | null
  topFlightNumber: string | null
  flightStatistics: FlightBookingStat[]
}
