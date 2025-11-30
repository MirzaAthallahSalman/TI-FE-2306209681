import { defineStore } from 'pinia'
import { ref } from 'vue'
import { flightApi } from '@/api/axiosConfig'
import type { Airline } from '@/interfaces/airline.interface'

export const useAirlineStore = defineStore('airline', () => {
  const airlines = ref<Airline[]>([])

  const fetchAirlines = async () => {
    try {
      const response = await flightApi.get<Airline[]>('/airlines')
      airlines.value = response.data
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
