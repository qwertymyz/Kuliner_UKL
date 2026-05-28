'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search, ShoppingCart, Plus, Minus, Trash2, ChevronRight, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { menuService } from '@/lib/services/menuService'
import { orderService } from '@/lib/services/orderService'
import { MenuItem, CartItem, MenuCategory, PaymentMethod } from '@/types'
import {
  formatRupiah, getCategoryColor, getErrorMessage, cn
} from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

const CATEGORIES: { label: string; value: string; emoji: string }[] = [
  { label: 'Semua', value: '', emoji: '🍴' },
  { label: 'Makanan', value: 'MAKANAN', emoji: '🍽️' },
  { label: 'Minuman', value: 'MINUMAN', emoji: '🥤' },
  { label: 'Snack', value: 'SNACK', emoji: '🍿' },
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'CASH', label: 'Tunai', icon: '💵' },
  { value: 'TRANSFER', label: 'Transfer', icon: '🏦' },
  { value: 'QRIS', label: 'QRIS', icon: '📱' },
]

export default function KasirTransaksiPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadMenu = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await menuService.getAll({
        search: search || undefined,
        category: filterCat || undefined,
      })
      setMenuItems(res.data.filter((m) => m.isAvailable))
    } catch {
      toast.error('Gagal memuat menu')
    } finally {
      setIsLoading(false)
    }
  }, [search, filterCat])

  useEffect(() => {
    const t = setTimeout(loadMenu, 300)
    return () => clearTimeout(t)
  }, [loadMenu])

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { menuItem: item, quantity: 1 }]
    })
  }

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((c) =>
        c.menuItem.id === id ? { ...c, quantity: c.quantity + delta } : c
      ).filter((c) => c.quantity > 0)
      return updated
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== id))
  }

  const totalItems = cart.reduce((a, c) => a + c.quantity, 0)
  const totalPrice = cart.reduce((a, c) => a + c.menuItem.price * c.quantity, 0)

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast.error('Nama pelanggan wajib diisi')
      return
    }
    if (cart.length === 0) {
      toast.error('Keranjang kosong')
      return
    }
    setIsSubmitting(true)
    try {
      await orderService.create({
        customerName: customerName.trim(),
        paymentMethod,
        items: cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity })),
      })
      toast.success('Pesanan berhasil dibuat! 🎉')
      setCart([])
      setCustomerName('')
      setPaymentMethod('CASH')
      setCheckoutOpen(false)
      setShowCart(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const CartPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
        <h3 className="font-bold text-gray-900 font-display flex items-center gap-2">
          <ShoppingCart size={18} className="text-orange-600" />
          Keranjang
          {totalItems > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </h3>
        <button onClick={() => setShowCart(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ShoppingCart className="text-gray-300 mb-2" size={32} />
            <p className="text-gray-400 text-sm">Keranjang kosong</p>
            <p className="text-gray-300 text-xs">Pilih menu untuk mulai</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.menuItem.id} className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.menuItem.name}</p>
                <p className="text-xs text-orange-600 font-medium">{formatRupiah(item.menuItem.price)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQty(item.menuItem.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.menuItem.id, 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-200 hover:text-green-500 transition-colors"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => removeFromCart(item.menuItem.id)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors ml-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-4 border-t border-orange-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">{totalItems} item</span>
            <span className="text-lg font-bold text-gray-900">{formatRupiah(totalPrice)}</span>
          </div>
          <button
            onClick={() => setCheckoutOpen(true)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Lanjutkan Pembayaran
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex gap-5 h-[calc(100vh-5rem)] relative">
      {/* Menu panel */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 font-display">Transaksi Baru</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pilih item menu untuk pesanan</p>
        </div>

        {/* Search & categories */}
        <div className="flex-shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilterCat(c.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                  filterCat === c.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
                )}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : menuItems.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Menu tidak ditemukan"
              description="Coba kata kunci lain atau hapus filter"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
              {menuItems.map((item) => {
                const inCart = cart.find((c) => c.menuItem.id === item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className={cn(
                      'card p-0 overflow-hidden text-left hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.97] relative',
                      inCart && 'ring-2 ring-orange-500'
                    )}
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center z-10">
                        {inCart.quantity}
                      </div>
                    )}
                    <div className={`h-1 ${item.category === 'MAKANAN' ? 'bg-orange-400' : item.category === 'MINUMAN' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                    <div className="p-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                        {item.category === 'MAKANAN' ? '🍽️' : item.category === 'MINUMAN' ? '🥤' : '🍿'}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900 mt-2 mb-1 line-clamp-2 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-orange-600 font-bold text-sm">{formatRupiah(item.price)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Cart sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-white rounded-2xl border border-orange-100 shadow-sm flex-shrink-0">
        <CartPanel />
      </aside>

      {/* Mobile cart FAB */}
      {totalItems > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-6 right-6 btn-primary flex items-center gap-3 shadow-lg z-30 rounded-2xl px-5 py-3"
        >
          <ShoppingCart size={20} />
          <span className="font-bold">{totalItems} item</span>
          <span className="font-bold">{formatRupiah(totalPrice)}</span>
        </button>
      )}

      {/* Mobile cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col">
            <CartPanel />
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Konfirmasi Pesanan"
        size="md"
      >
        <div className="space-y-4">
          {/* Order summary */}
          <div className="bg-orange-50 rounded-xl p-4 space-y-2">
            {cart.map((c) => (
              <div key={c.menuItem.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{c.menuItem.name} × {c.quantity}</span>
                <span className="font-semibold text-gray-900">{formatRupiah(c.menuItem.price * c.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-orange-200 pt-2 flex justify-between font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-orange-600 text-base">{formatRupiah(totalPrice)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Pelanggan</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama pelanggan"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  onClick={() => setPaymentMethod(pm.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all',
                    paymentMethod === pm.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                  )}
                >
                  <span className="text-xl">{pm.icon}</span>
                  <span>{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setCheckoutOpen(false)} className="btn-secondary flex-1">
              Batal
            </button>
            <button
              onClick={handleCheckout}
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
