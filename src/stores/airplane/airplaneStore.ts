/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Airplane, AirplaneRequest } from '@/interfaces/airplane.interface'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const useAirplaneStore = defineStore('airplane', () => {
  const airplanes = ref<Airplane[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all airplanes
  const fetchAirplanes = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<Airplane[]>(`${API_URL}/airplanes`)
      airplanes.value = response.data // ← Langsung response.data
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
      const response = await axios.get<Airplane>(`${API_URL}/airplanes/${id}`)
      return response.data // ← Langsung response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch airplane'
      throw err
    }
  }

  // Create airplane
  const createAirplane = async (request: AirplaneRequest): Promise<Airplane> => {
    try {
      const response = await axios.post<Airplane>(
        `${API_URL}/airplanes`,
        request
      )
      await fetchAirplanes()
      return response.data // ← Langsung response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create airplane'
      throw err
    }
  }

  // Update airplane
  const updateAirplane = async (id: string, request: AirplaneRequest): Promise<Airplane> => {
    try {
      const response = await axios.put<Airplane>(
        `${API_URL}/airplanes/${id}`,
        request
      )
      await fetchAirplanes()
      return response.data // ← Langsung response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update airplane'
      throw err
    }
  }

  // Delete airplane
  const deleteAirplane = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/airplanes/${id}`)
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
      const response = await axios.get<Airplane[]>(`${API_URL}/airplanes/search`, {
        params
      })
      airplanes.value = response.data // ← Langsung response.data
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
