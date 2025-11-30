// ===== Passenger DTOs =====
export interface PassengerSelection {
  passengerId: string // UUID
  seatCode: string
  passengerName?: string // Optional for display
  passengerGender?: string // Optional for display
}

export interface PassengerInfo {
  passengerId: string
  fullName: string
  birthDate: string
  gender: number
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

export interface PassengerCreateData {
  fullName: string
  birthDate: string // Format: YYYY-MM-DD
  gender: number    // 1=Male, 2=Female, 3=Other
  idPassport: string
  seatCode: string
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
  // ❌ REMOVED userId
  contactEmail: string
  contactPhone: string
  passengerCount: number
  passengers: PassengerCreateData[]
}

// ===== Booking Response =====
export interface BookingResponse {
  bookingId: string
  bookingCode: string
  flightId: string
  flightNumber: string
  classFlightId: number
  className: string
  // ❌ REMOVED userId
  contactEmail: string
  contactPhone: string
  passengerCount: number
  status: number
  statusText: string
  totalPrice: number
  createdAt: string
  originAirportCode: string
  originAirportName: string
  destinationAirportCode: string
  destinationAirportName: string
  departureTime: string
  arrivalTime: string
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
  // ❌ REMOVED userId
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

/**
 * ✅ UPDATED: Full passenger data for two-way booking (not just ID reference)
 */
export interface PassengerFlightSelection {
  fullName: string
  birthDate: string // Format: YYYY-MM-DD
  gender: number    // 1=Male, 2=Female, 3=Other
  idPassport: string
  seatCode: string
}

/**
 * ✅ UPDATED: Two-way booking request with full passenger data
 */
export interface TwoWayBookingRequest {
  // Departure Flight
  departureFlightId: string
  departureClassFlightId: number

  // Return Flight
  returnFlightId: string
  returnClassFlightId: number

  // ❌ REMOVED userId

  // Shared Information
  contactEmail: string
  contactPhone: string
  passengerCount: number

  // ✅ UPDATED: Passenger with full data (not just selection)
  departurePassengers: PassengerFlightSelection[]
  returnPassengers: PassengerFlightSelection[]
}

export interface SeatAvailability {
  seatCode: string
  seatCodeShort: string
  isAvailable: boolean
  classType: number
}

/**
 * ✅ UPDATED: Enhanced two-way booking response
 */
export interface TwoWayBookingResponse {
  // Departure Booking
  departureBooking: BookingResponse
  departureBookingId: string
  departureBookingCode: string // ✅ Added

  // Return Booking
  returnBooking: BookingResponse
  returnBookingId: string
  returnBookingCode: string // ✅ Added

  // Summary
  totalPassengers: number
  totalPrice: number
  contactEmail: string // ✅ Added
  contactPhone: string // ✅ Added

  // Route summary
  originAirportCode: string // ✅ Added
  originAirportName: string // ✅ Added
  destinationAirportCode: string // ✅ Added
  destinationAirportName: string // ✅ Added

  // Timing
  departureFlightTime: string // ✅ Added
  returnFlightTime: string // ✅ Added
  createdAt: string // ✅ Added

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

// ===== Flight Detail (for booking form) =====
export interface ClassFlight {
  id: number
  className: string
  classType: number
  price: number
  seatCapacity: number
  availableSeats: number
  totalSeats: number
  actualAvailableSeats: number
}

export interface FlightDetail {
  id: string
  flightNumber: string
  originAirportCode: string
  originAirportName: string
  originCity: string
  destinationAirportCode: string
  destinationAirportName: string
  destinationCity: string
  departureTime: string
  arrivalTime: string
  status: number
  terminal: string
  gate: string
  airlineName: string
  classFlights: ClassFlight[]
  totalAvailableSeats: number
}
