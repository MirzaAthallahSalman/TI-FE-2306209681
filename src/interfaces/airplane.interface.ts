export interface Airplane {
  id: string
  registrationNumber: string
  airlineId: string
  airlineName: string
  model: string
  seatCapacity: number
  manufactureYear: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AirplaneRequest {
  id?: string
  airlineId: string
  model: string
  seatCapacity: number
  manufactureYear: number
}
