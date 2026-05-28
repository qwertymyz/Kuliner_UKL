import api from '@/lib/api'
import { Order, CreateOrderPayload, ApiResponse, PaginatedResponse, OrderStatus, PaymentMethod } from '@/types'

const mapUser = (backendUser: any) => {
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

const mapMenuItem = (backendMenu: any) => {
  if (!backendMenu) return null as any
  return {
    id: backendMenu.id,
    name: backendMenu.nama || '',
    category: backendMenu.kategori,
    price: backendMenu.harga,
    image: backendMenu.gambarUrl,
    isAvailable: backendMenu.tersedia,
    createdAt: backendMenu.createdAt,
    updatedAt: backendMenu.updatedAt,
  }
}

const mapOrderStatusToFrontend = (status: string): OrderStatus => {
  switch (status) {
    case 'DIPROSES': return 'PROCESSING'
    case 'SELESAI': return 'DONE'
    case 'DIBATALKAN': return 'CANCELLED'
    default: return 'PENDING'
  }
}

const mapOrderStatusToBackend = (status: OrderStatus): string => {
  switch (status) {
    case 'PROCESSING': return 'DIPROSES'
    case 'DONE': return 'SELESAI'
    case 'CANCELLED': return 'DIBATALKAN'
    default: return 'PENDING'
  }
}

const mapPaymentMethodToFrontend = (method: string): PaymentMethod => {
  switch (method) {
    case 'TUNAI': return 'CASH'
    case 'TRANSFER': return 'TRANSFER'
    case 'QRIS': return 'QRIS'
    default: return 'CASH'
  }
}

const mapPaymentMethodToBackend = (method: PaymentMethod): string => {
  switch (method) {
    case 'CASH': return 'TUNAI'
    case 'TRANSFER': return 'TRANSFER'
    case 'QRIS': return 'QRIS'
    default: return 'TUNAI'
  }
}

const mapOrder = (backendOrder: any): Order => {
  if (!backendOrder) return null as any
  return {
    id: backendOrder.id,
    userId: backendOrder.kasirId,
    user: mapUser(backendOrder.kasir),
    customerName: backendOrder.namaPelanggan || '',
    status: mapOrderStatusToFrontend(backendOrder.status),
    paymentMethod: mapPaymentMethodToFrontend(backendOrder.metodeBayar),
    totalAmount: backendOrder.totalHarga,
    items: (backendOrder.itemPesanan || []).map((item: any) => ({
      id: item.id,
      orderId: item.pesananId,
      menuItemId: item.menuId,
      menuItem: mapMenuItem(item.menu),
      quantity: item.jumlah,
      price: item.hargaSaat,
      subtotal: item.jumlah * item.hargaSaat,
    })),
    createdAt: backendOrder.createdAt,
    updatedAt: backendOrder.updatedAt,
  }
}

export const orderService = {
  getAll: async (params?: { status?: OrderStatus; page?: number; limit?: number }) => {
    const backendParams = {
      status: params?.status ? mapOrderStatusToBackend(params.status) : undefined,
    }
    const response = await api.get<{ success: boolean; message: string; data: any[] }>('/pesanan', { params: backendParams })
    return {
      message: response.data.message,
      data: (response.data.data || []).map(mapOrder),
      total: (response.data.data || []).length,
      page: 1,
      limit: (response.data.data || []).length,
    }
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; message: string; data: any }>(`/pesanan/${id}`)
    return {
      message: response.data.message,
      data: mapOrder(response.data.data),
    }
  },

  create: async (payload: CreateOrderPayload) => {
    const backendPayload = {
      nomorMeja: 1, // default
      namaPelanggan: payload.customerName,
      metodeBayar: mapPaymentMethodToBackend(payload.paymentMethod),
      items: payload.items.map(item => ({
        menuId: item.menuItemId,
        jumlah: item.quantity,
      }))
    }
    const response = await api.post<{ success: boolean; message: string; data: any }>('/pesanan', backendPayload)
    return {
      message: response.data.message,
      data: mapOrder(response.data.data),
    }
  },

  updateStatus: async (id: number, status: OrderStatus) => {
    const backendStatus = mapOrderStatusToBackend(status)
    const response = await api.patch<{ success: boolean; message: string; data: any }>(`/pesanan/${id}/status`, { status: backendStatus })
    return {
      message: response.data.message,
      data: mapOrder(response.data.data),
    }
  },

  getMyOrders: async (params?: { status?: OrderStatus }) => {
    const backendParams = {
      status: params?.status ? mapOrderStatusToBackend(params.status) : undefined,
    }
    const response = await api.get<{ success: boolean; message: string; data: any[] }>('/pesanan', { params: backendParams })
    return {
      message: response.data.message,
      data: (response.data.data || []).map(mapOrder),
      total: (response.data.data || []).length,
      page: 1,
      limit: (response.data.data || []).length,
    }
  },
}
