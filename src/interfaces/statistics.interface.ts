// src/interfaces/statistics.interface.ts

export interface BookingStatistics {
  month: number
  year: number
  totalBookings: number
  totalRevenue: number
  topFlightId: string | null
  topFlightNumber: string | null
  flightStatistics: FlightBookingStat[]
}

export interface FlightBookingStat {
  flightId: string
  flightNumber: string
  originAirportCode: string
  destinationAirportCode: string
  bookingCount: number
  revenue: number
}
