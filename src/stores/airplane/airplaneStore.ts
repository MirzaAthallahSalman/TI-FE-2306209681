/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { flightApi } from '@/api/axiosConfig'
import type { Airplane, AirplaneRequest } from '@/interfaces/airplane.interface'

export const useAirplaneStore = defineStore('airplane', () => {
  const airplanes = ref<Airplane[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all airplanes
  const fetchAirplanes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await flightApi.get<Airplane[]>('/airplanes')
      airplanes.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch airplanes'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get airplane by ID
  const getAirplaneById = async (id: string): Promise<Airplane> => {
    try {
      const response = await flightApi.get<Airplane>(`/airplanes/${id}`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch airplane'
      throw err
    }
  }

  // Create airplane
  const createAirplane = async (request: AirplaneRequest): Promise<Airplane> => {
    try {
      const response = await flightApi.post<Airplane>('/airplanes', request)
      await fetchAirplanes()
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create airplane'
      throw err
    }
  }

  // Update airplane
  const updateAirplane = async (id: string, request: AirplaneRequest): Promise<Airplane> => {
    try {
      const response = await flightApi.put<Airplane>(`/airplanes/${id}`, request)
      await fetchAirplanes()
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update airplane'
      throw err
    }
  }

  // Delete airplane
  const deleteAirplane = async (id: string) => {
    try {
      await flightApi.delete(`/airplanes/${id}`)
      await fetchAirplanes()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete airplane'
      throw err
    }
  }

  // Search airplanes
  const searchAirplanes = async (params: {
    search?: string
    airlineId?: string
    model?: string
    year?: number
    activeOnly?: boolean
  }) => {
    loading.value = true
    error.value = null
    try {
      const response = await flightApi.get<Airplane[]>('/airplanes/search', { params })
      airplanes.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search airplanes'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    airplanes,
    loading,
    error,
    fetchAirplanes,
    getAirplaneById,
    createAirplane,
    updateAirplane,
    deleteAirplane,
    searchAirplanes
  }
})
