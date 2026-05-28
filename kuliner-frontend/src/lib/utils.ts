import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { OrderStatus, MenuCategory, PaymentMethod } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: 'Menunggu',
    PROCESSING: 'Diproses',
    DONE: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return map[status]
}

export function getOrderStatusClass(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: 'badge-warning',
    PROCESSING: 'badge-info',
    DONE: 'badge-success',
    CANCELLED: 'badge-danger',
  }
  return map[status]
}

export function getCategoryLabel(category: MenuCategory): string {
  const map: Record<MenuCategory, string> = {
    MAKANAN: '🍽️ Makanan',
    MINUMAN: '🥤 Minuman',
    SNACK: '🍿 Snack',
  }
  return map[category]
}

export function getCategoryColor(category: MenuCategory): string {
  const map: Record<MenuCategory, string> = {
    MAKANAN: 'bg-orange-100 text-orange-700',
    MINUMAN: 'bg-blue-100 text-blue-700',
    SNACK: 'bg-purple-100 text-purple-700',
  }
  return map[category]
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    CASH: '💵 Tunai',
    TRANSFER: '🏦 Transfer',
    QRIS: '📱 QRIS',
  }
  return map[method]
}

export function getErrorMessage(error: unknown): string {
  if (axios_isAxiosError(error)) {
    return error.response?.data?.message || 'Terjadi kesalahan'
  }
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan'
}

function axios_isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
  return typeof error === 'object' && error !== null && 'response' in error
}
