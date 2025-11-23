import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Airline } from '@/interfaces/airline.interface'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

export const useAirlineStore = defineStore('airline', () => {
  const airlines = ref<Airline[]>([])

  const fetchAirlines = async () => {
    try {
      // ❌ BEFORE (dengan BaseResponse):
      // const response = await axios.get<BaseResponse<Airline[]>>(`${API_URL}/airlines`)
      // airlines.value = response.data.data

      // ✅ AFTER (tanpa BaseResponse):
      const response = await axios.get<Airline[]>(`${API_BASE_URL}/airlines`)
      airlines.value = response.data // ← Langsung ambil response.data

    } catch (err) {
      console.error('Failed to fetch airlines:', err)
      throw err
    }
  }

  return {
    airlines,
    fetchAirlines
  }
})
