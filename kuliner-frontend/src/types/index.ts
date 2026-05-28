// =================== AUTH TYPES ===================
export interface User {
  id: number
  username: string
  name: string
  role: 'ADMIN' | 'KASIR'
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

// =================== MENU TYPES ===================
export type MenuCategory = 'MAKANAN' | 'MINUMAN' | 'SNACK'

export interface MenuItem {
  id: number
  name: string
  category: MenuCategory
  price: number
  image?: string | null
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMenuPayload {
  name: string
  category: MenuCategory
  price: number
  image?: string
  isAvailable?: boolean
}

export interface UpdateMenuPayload extends Partial<CreateMenuPayload> {}

// =================== ORDER TYPES ===================
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS'

export interface OrderItem {
  id: number
  orderId: number
  menuItemId: number
  menuItem: MenuItem
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  userId: number
  user: User
  customerName: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  totalAmount: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderItemPayload {
  menuItemId: number
  quantity: number
}

export interface CreateOrderPayload {
  customerName: string
  paymentMethod: PaymentMethod
  items: CreateOrderItemPayload[]
}

// =================== LAPORAN TYPES ===================
export interface SummaryStats {
  totalTransaksi: number
  totalPendapatan: number
  transaksiHariIni: number
  pendapatanHariIni: number
}

export interface DailyRevenue {
  date: string
  total: number
  count: number
}

export interface CategorySales {
  category: MenuCategory
  total: number
  count: number
}

export interface TopMenuItem {
  menuItemId: number
  name: string
  category: MenuCategory
  totalSold: number
  totalRevenue: number
}

export interface LaporanResponse {
  summary: SummaryStats
  dailyRevenue: DailyRevenue[]
  categorySales: CategorySales[]
  topItems: TopMenuItem[]
}

// =================== API RESPONSE TYPES ===================
export interface ApiResponse<T> {
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  message: string
  data: T[]
  total: number
  page: number
  limit: number
}

// =================== CART TYPES (Frontend Only) ===================
export interface CartItem {
  menuItem: MenuItem
  quantity: number
}
