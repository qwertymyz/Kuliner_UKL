import api from '@/lib/api'
import { Order, CreateOrderPayload, ApiResponse, PaginatedResponse, OrderStatus } from '@/types'

export const orderService = {
  getAll: async (params?: { status?: OrderStatus; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders', { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`)
    return data
  },

  create: async (payload: CreateOrderPayload) => {
    const { data } = await api.post<ApiResponse<Order>>('/orders', payload)
    return data
  },

  updateStatus: async (id: number, status: OrderStatus) => {
    const { data } = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status })
    return data
  },

  getMyOrders: async (params?: { status?: OrderStatus }) => {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders/my', { params })
    return data
  },
}
