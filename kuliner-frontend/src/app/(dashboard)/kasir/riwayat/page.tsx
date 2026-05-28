'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, History, ChevronDown, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService } from '@/lib/services/orderService'
import { Order, OrderStatus } from '@/types'
import {
  formatRupiah, formatDate, getOrderStatusLabel, getOrderStatusClass,
  getPaymentMethodLabel, getErrorMessage, cn,
} from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import Modal from '@/components/ui/Modal'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'DONE', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PROCESSING',
  PROCESSING: 'DONE',
}

export default function KasirRiwayatPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await orderService.getMyOrders({
        status: filterStatus as OrderStatus || undefined,
      })
      setOrders(res.data)
    } catch {
      toast.error('Gagal memuat riwayat')
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleUpdateStatus = async (order: Order, newStatus: OrderStatus) => {
    setIsUpdating(true)
    try {
      await orderService.updateStatus(order.id, newStatus)
      toast.success(`Status diperbarui ke ${getOrderStatusLabel(newStatus)}`)
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
      loadOrders()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async (order: Order) => {
    setIsUpdating(true)
    try {
      await orderService.updateStatus(order.id, 'CANCELLED')
      toast.success('Pesanan dibatalkan')
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: 'CANCELLED' })
      }
      loadOrders()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Riwayat Pesanan</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola status pesanan</p>
        </div>
        <button
          onClick={loadOrders}
          className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              filterStatus === s.value
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada pesanan"
          description="Pesanan yang masuk akan muncul di sini"
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="card hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 font-display">#{order.id}</span>
                    <span className={getOrderStatusClass(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{order.customerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.items?.length ?? 0} item • {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600 text-base">{formatRupiah(order.totalAmount)}</p>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpdateStatus(order, NEXT_STATUS[order.status]!)
                      }}
                      disabled={isUpdating}
                      className="mt-2 text-xs btn-primary px-3 py-1.5"
                    >
                      → {getOrderStatusLabel(NEXT_STATUS[order.status]!)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order detail modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Detail Pesanan #${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3 bg-orange-50 rounded-xl p-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Pelanggan</p>
                <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Status</p>
                <span className={getOrderStatusClass(selectedOrder.status)}>
                  {getOrderStatusLabel(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Pembayaran</p>
                <p className="font-semibold text-gray-900">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Waktu</p>
                <p className="font-semibold text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Item Pesanan</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                    <div>
                      <span className="font-medium text-gray-900">{item.menuItem?.name}</span>
                      <span className="text-gray-400 ml-2">× {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-orange-600 text-base">{formatRupiah(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PROCESSING') && (
              <div className="flex gap-3 pt-2">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(selectedOrder)}
                    className="btn-secondary flex-1 text-red-500 border-red-200 hover:bg-red-50"
                    disabled={isUpdating}
                  >
                    Batalkan
                  </button>
                )}
                {NEXT_STATUS[selectedOrder.status] && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder, NEXT_STATUS[selectedOrder.status]!)}
                    className="btn-primary flex-1"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Memperbarui...' : `→ ${getOrderStatusLabel(NEXT_STATUS[selectedOrder.status]!)}`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
