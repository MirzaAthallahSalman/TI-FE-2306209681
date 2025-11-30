export interface AirplaneRequest {
  // Hapus 'id?' dari sini, karena ini adalah DTO request untuk POST/PUT
  // Jika DTO ini digunakan untuk PUT/Update, tambahkan 'id' di level service/controller.
  // Sesuai dengan AirplaneRequestDTO Java, field ini adalah yang dikirim user.
 
  airlineId: string // Harus sesuai dengan @NotNull(UUID) di Java DTO
  model: string // Harus sesuai dengan @NotBlank(String) di Java DTO
  seatCapacity: number // Harus sesuai dengan @NotNull(Integer) di Java DTO
  manufactureYear: number // Harus sesuai dengan @NotNull(Integer) di Java DTO
}

export interface Airplane {
  id: string // UUID -> string
  airlineId: string // UUID -> string
  airlineName: string // Dari Response DTO
  model: string
  seatCapacity: number
  manufactureYear: number
  registrationNumber: string | null // Dianggap bisa null/kosong
  isDeleted: boolean
  createdAt: string // LocalDateTime -> string
  updatedAt: string // LocalDateTime -> string
}
