/**
 * Auth Interface Definitions
 * For authentication with profile service at http://2306223206-be.hafizmuh.site
 */

// User roles from ti-2306223206 Role enum
export type UserRole =
  | 'SUPERADMIN'
  | 'CUSTOMER'
  | 'FLIGHT_AIRLINE'
  | 'ACCOMMODATION_OWNER'
  | 'RENTAL_VENDOR'
  | 'INSURANCE_PROVIDER'
  | 'TOUR_PACKAGE_VENDOR'

export interface User {
  id: string
  username: string
  email: string
  name?: string
  role: UserRole
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  name: string
  role: UserRole
  gender?: 'MALE' | 'FEMALE'
}

// Response from profile service (wraps in BaseResponse)
export interface ProfileServiceResponse<T> {
  status: number
  message: string
  data: T
  timestamp?: string
}

// Auth response data from profile service
export interface AuthResponseData {
  token: string
  userId: string
  username: string
  email: string
  role: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPERADMIN: 'Super Admin',
  CUSTOMER: 'Customer',
  FLIGHT_AIRLINE: 'Flight Airline',
  ACCOMMODATION_OWNER: 'Accommodation Owner',
  RENTAL_VENDOR: 'Rental Vendor',
  INSURANCE_PROVIDER: 'Insurance Provider',
  TOUR_PACKAGE_VENDOR: 'Tour Package Vendor',
}

// Role descriptions for registration
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPERADMIN: 'Full system access and management',
  CUSTOMER: 'Book flights and create support tickets',
  FLIGHT_AIRLINE: 'Manage flights and handle flight-related tickets',
  ACCOMMODATION_OWNER: 'Manage accommodations and handle tickets',
  RENTAL_VENDOR: 'Manage rentals and handle tickets',
  INSURANCE_PROVIDER: 'Manage insurance and handle tickets',
  TOUR_PACKAGE_VENDOR: 'Manage tour packages and handle tickets',
}

// Available roles for registration (exclude SUPERADMIN)
export const REGISTRABLE_ROLES: UserRole[] = [
  'CUSTOMER',
  'FLIGHT_AIRLINE',
  'ACCOMMODATION_OWNER',
  'RENTAL_VENDOR',
  'INSURANCE_PROVIDER',
  'TOUR_PACKAGE_VENDOR',
]
