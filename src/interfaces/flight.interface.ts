// ===== Aircraft Info =====
export interface AircraftInfo {
  aircraftId: string
  model: string
  seatCapacity: number
  manufactureYear: number
}

// ===== Seat Map =====
export interface SeatMap {
  seatCode: string
  isAvailable: boolean
  passengerName: string | null
}

// ===== Class Flight DTOs =====
export interface ClassFlightResponse {
  id: number
  classType: number // 1=Economy, 2=Business, 3=First
  className: string
  seatCapacity: number
  availableSeats: number
  price: number
}

export interface ClassFlightDetail {
  id: number
  classType: number
  className: string
  price: number
  totalSeats: number
  availableSeats: number
  bookedSeats: number
  occupancyPercentage: number
  seatMap: SeatMap[]
}

export interface ClassFlightRequest {
  classType: number
  seatCapacity: number
  price: number
}

export interface ClassFlightUpdate {
  id?: number | null // null jika class baru, ada value jika update existing
  classType: number
  seatCapacity: number
  price: number
}

// ===== Flight DTOs =====
export interface FlightResponse {
  id: string
  flightNumber: string // 💡 Ditambahkan (Ada di FlightResponseDTO)
  airlineId: string
  airlineName: string
  airplaneId: string
  airplaneModel: string
 
  // 💡 PERUBAHAN: Tambahkan ID Bandara
  originAirportCode: string
  originAirportName: string
  originCity: string
  destinationAirportCode: string
  destinationAirportName: string
  destinationCity: string
 
  departureTime: string // ISO string (LocalDateTime)
  arrivalTime: string // ISO string (LocalDateTime)
  terminal: string | null
  gate: string
  baggageAllowance: number
  facilities: string | null
  status: number
  statusText: string
  totalSeats: number
  availableSeats: number
  createdAt: string // (LocalDateTime)
  updatedAt: string // (LocalDateTime)
  classFlights: ClassFlightResponse[]
}

export interface FlightDetailResponse {
  flightNumber: string
  airlineId: string
  airlineName: string
  airlineCountry: string
  status: number
  statusText: string

  originAirportCode: string
  originAirportName: string
  originCity: string
  originCountry: string

  destinationAirportCode: string
  destinationAirportName: string
  destinationCity: string
  destinationCountry: string

  departureTime: string
  arrivalTime: string
  terminal: string | null
  gate: string

  baggageAllowance: number
  facilities: string | null

  aircraftInfo: AircraftInfo
  classFlights: ClassFlightDetail[]

  createdAt: string
  updatedAt: string
}

export interface FlightRequest {
  airlineId: string // (UUID)
  airplaneId: string // (UUID)

  // 💡 PERUBAHAN: Tambahkan ID Bandara (UUID)
  // (UUID) - Wajib (Not Null di BE)

  // Code bandara tetap ada di interface agar BE DTO lengkap,
  // tetapi nilainya bisa string kosong/null dari FE karena BE yang akan mengisi ulang.
  // Di FE, ini bisa dianggap opsional / diabaikan
  originAirportCode?: string
  destinationAirportCode?: string

  departureTime: string // ISO string (LocalDateTime)
  arrivalTime: string // ISO string (LocalDateTime)
  terminal?: string | null
  gate: string
  baggageAllowance: number
  facilities?: string | null
  classFlights: ClassFlightRequest[]
}

export interface FlightUpdateRequest {
  departureTime: string // (LocalDateTime)
  arrivalTime: string // (LocalDateTime)
  terminal?: string | null // string | null (di BE adalah String)
  gate?: string | null // string | null
  baggageAllowance: number
  facilities?: string | null
  classFlights: ClassFlightUpdate[]
}

// ===== Search & Filter Params =====
export interface FlightSearchParams {
  origin?: string
  destination?: string
  airline?: string
  status?: number
  search?: string
  sortBy?: string
}

export interface RoundTripParams {
  origin: string
  destination: string
  departureDate?: string // ISO string
  returnDate?: string // ISO string
}
