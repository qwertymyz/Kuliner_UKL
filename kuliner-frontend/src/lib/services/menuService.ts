import api from '@/lib/api'
import { MenuItem, CreateMenuPayload, UpdateMenuPayload, ApiResponse, PaginatedResponse } from '@/types'

export const menuService = {
  getAll: async (params?: { category?: string; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<MenuItem>>('/menu', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<MenuItem>>(`/menu/${id}`)
    return data
  },

  create: async (payload: CreateMenuPayload) => {
    const { data } = await api.post<ApiResponse<MenuItem>>('/menu', payload)
    return data
  },

  update: async (id: number, payload: UpdateMenuPayload) => {
    const { data } = await api.put<ApiResponse<MenuItem>>(`/menu/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/menu/${id}`)
    return data
  },

  toggleAvailability: async (id: number, isAvailable: boolean) => {
    const { data } = await api.patch<ApiResponse<MenuItem>>(`/menu/${id}/availability`, { isAvailable })
    return data
  },
}
