import api from '@/lib/api'
import { User, ApiResponse, PaginatedResponse } from '@/types'

export interface CreateUserPayload {
  username: string
  password: string
  name: string
  role: 'ADMIN' | 'KASIR'
}

export interface UpdateUserPayload {
  username?: string
  password?: string
  name?: string
  role?: 'ADMIN' | 'KASIR'
}

export const userService = {
  getAll: async (params?: { role?: string; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`)
    return data
  },

  create: async (payload: CreateUserPayload) => {
    const { data } = await api.post<ApiResponse<User>>('/users', payload)
    return data
  },

  update: async (id: number, payload: UpdateUserPayload) => {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/users/${id}`)
    return data
  },
}
