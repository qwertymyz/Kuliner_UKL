import api from '@/lib/api'
import { LoginPayload, AuthResponse, User } from '@/types'

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

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<{ success: boolean; message: string; data: { user: any; token: string } }>('/auth/login', payload)
    return {
      message: response.data.message,
      token: response.data.data.token,
      user: mapUser(response.data.data.user),
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore client-side logout if endpoint doesn't exist
    }
  },

  me: async () => {
    const response = await api.get<{ success: boolean; data: any }>('/auth/me')
    return mapUser(response.data.data)
  },
}
