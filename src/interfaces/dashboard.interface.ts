// src/interfaces/dashboard.interface.ts

export interface DashboardStats {
  activeFlights: number      // Penerbangan aktif (status Scheduled & In Flight)
  todayBookings: number      // Booking dibuat hari ini
  registeredAirlines: number // Maskapai terdaftar
}
