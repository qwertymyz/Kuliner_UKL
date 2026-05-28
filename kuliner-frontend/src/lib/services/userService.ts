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

const mapUser = (backendUser: any): User => {
  if (!backendUser) return null as any
  return {
    id: backendUser.id,
    username: backendUser.username,
    name: backendUser.nama || '',
    role: backendUser.role,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  }
}

export const userService = {
  getAll: async (params?: { role?: string; search?: string }) => {
    const response = await api.get<{ success: boolean; message: string; data: any[] }>('/users', { params })
    return {
      message: response.data.message,
      data: (response.data.data || []).map(mapUser),
      total: (response.data.data || []).length,
      page: 1,
      limit: (response.data.data || []).length,
    }
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; message: string; data: any }>(`/users/${id}`)
    return {
      message: response.data.message,
      data: mapUser(response.data.data),
    }
  },

  create: async (payload: CreateUserPayload) => {
    const backendPayload = {
      username: payload.username,
      password: payload.password,
      nama: payload.name,
      role: payload.role,
    }
    const response = await api.post<{ success: boolean; message: string; data: any }>('/users', backendPayload)
    return {
      message: response.data.message,
      data: mapUser(response.data.data),
    }
  },

  update: async (id: number, payload: UpdateUserPayload) => {
    const backendPayload = {
      username: payload.username,
      password: payload.password || undefined,
      nama: payload.name,
      role: payload.role,
    }
    const response = await api.put<{ success: boolean; message: string; data: any }>(`/users/${id}`, backendPayload)
    return {
      message: response.data.message,
      data: mapUser(response.data.data),
    }
  },

  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`)
    return {
      message: response.data.message,
      data: null,
    }
  },
}
