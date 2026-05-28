import api from '@/lib/api'
import { MenuItem, CreateMenuPayload, UpdateMenuPayload, ApiResponse, PaginatedResponse } from '@/types'

const mapMenuItem = (backendMenu: any): MenuItem => {
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

export const menuService = {
  getAll: async (params?: { category?: string; search?: string }) => {
    const backendParams = {
      kategori: params?.category || undefined,
    }
    const response = await api.get<{ success: boolean; message: string; data: any[] }>('/menus', { params: backendParams })
    
    let list = response.data.data || []
    if (params?.search) {
      const q = params.search.toLowerCase()
      list = list.filter(item => item.nama.toLowerCase().includes(q))
    }

    return {
      message: response.data.message,
      data: list.map(mapMenuItem),
      total: list.length,
      page: 1,
      limit: list.length,
    }
  },

  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; message: string; data: any }>(`/menus/${id}`)
    return {
      message: response.data.message,
      data: mapMenuItem(response.data.data),
    }
  },

  create: async (payload: CreateMenuPayload) => {
    const backendPayload = {
      nama: payload.name,
      kategori: payload.category,
      harga: payload.price,
      tersedia: payload.isAvailable !== undefined ? payload.isAvailable : true,
      gambarUrl: payload.image || null,
    }
    const response = await api.post<{ success: boolean; message: string; data: any }>('/menus', backendPayload)
    return {
      message: response.data.message,
      data: mapMenuItem(response.data.data),
    }
  },

  update: async (id: number, payload: UpdateMenuPayload) => {
    const backendPayload = {
      nama: payload.name,
      kategori: payload.category,
      harga: payload.price !== undefined ? Number(payload.price) : undefined,
      tersedia: payload.isAvailable,
      gambarUrl: payload.image,
    }
    const response = await api.put<{ success: boolean; message: string; data: any }>(`/menus/${id}`, backendPayload)
    return {
      message: response.data.message,
      data: mapMenuItem(response.data.data),
    }
  },

  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/menus/${id}`)
    return {
      message: response.data.message,
      data: null,
    }
  },

  toggleAvailability: async (id: number, isAvailable: boolean) => {
    const response = await api.put<{ success: boolean; message: string; data: any }>(`/menus/${id}`, { tersedia: isAvailable })
    return {
      message: response.data.message,
      data: mapMenuItem(response.data.data),
    }
  },
}
