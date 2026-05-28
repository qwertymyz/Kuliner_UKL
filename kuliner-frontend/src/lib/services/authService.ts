import api from '@/lib/api'
import { LoginPayload, AuthResponse } from '@/types'

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  me: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },
}
