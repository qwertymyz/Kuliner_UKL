'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { menuService } from '@/lib/services/menuService'
import { MenuItem, MenuCategory, CreateMenuPayload } from '@/types'
import { formatRupiah, getCategoryColor, getCategoryLabel, getErrorMessage } from '@/lib/utils'

type MenuForm = { name: string; category: MenuCategory; price: string; isAvailable: boolean }
const defaultForm: MenuForm = { name: '', category: 'MAKANAN', price: '', isAvailable: true }
const CATEGORIES: MenuCategory[] = ['MAKANAN', 'MINUMAN', 'SNACK']

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<MenuForm>(defaultForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadMenu = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await menuService.getAll({
        search: search || undefined,
        category: filterCat || undefined,
      })
      setItems(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [search, filterCat])

  useEffect(() => {
    const t = setTimeout(loadMenu, 300)
    return () => clearTimeout(t)
  }, [loadMenu])

  const openCreate = () => {
    setEditItem(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditItem(item)
    setForm({ name: item.name, category: item.category, price: String(item.price), isAvailable: item.isAvailable })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) {
      toast.error('Nama dan harga wajib diisi')
      return
    }
    const priceNum = parseInt(form.price.replace(/\D/g, ''))
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Harga tidak valid')
      return
    }
    setIsSaving(true)
    try {
      const payload: CreateMenuPayload = {
        name: form.name,
        category: form.category,
        price: priceNum,
        isAvailable: form.isAvailable,
      }
      if (editItem) {
        await menuService.update(editItem.id, payload)
        toast.success('Menu berhasil diperbarui')
      } else {
        await menuService.create(payload)
        toast.success('Menu berhasil ditambahkan')
      }
      setModalOpen(false)
      loadMenu()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (item: MenuItem) => {
    try {
      await menuService.toggleAvailability(item.id, !item.isAvailable)
      toast.success(item.isAvailable ? 'Menu dinonaktifkan' : 'Menu diaktifkan')
      loadMenu()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      await menuService.delete(deleteItem.id)
      toast.success('Menu berhasil dihapus')
      setDeleteItem(null)
      loadMenu()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Kelola Menu</h1>
          <p className="text-gray-500 text-sm mt-0.5">Makanan, minuman & snack</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Tambah Menu
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterCat('')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!filterCat ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'}`}
          >
            Semua
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${filterCat === cat ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'}`}
            >
              {cat === 'MAKANAN' ? '🍽️' : cat === 'MINUMAN' ? '🥤' : '🍿'} {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Belum ada menu"
          description="Tambahkan menu pertama dengan menekan tombol di atas"
          action={
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              Tambah Menu
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`card p-0 overflow-hidden transition-all hover:shadow-md ${!item.isAvailable ? 'opacity-60' : ''}`}>
              {/* Category bar */}
              <div className={`h-1 w-full ${item.category === 'MAKANAN' ? 'bg-orange-400' : item.category === 'MINUMAN' ? 'bg-blue-400' : 'bg-purple-400'}`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <button onClick={() => handleToggle(item)} className="text-gray-400 hover:text-orange-600 transition-colors">
                    {item.isAvailable
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} />
                    }
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mt-2 mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-orange-600 font-bold text-base">{formatRupiah(item.price)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium transition-colors"
                  >
                    <Trash2 size={12} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Menu' : 'Tambah Menu Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Menu</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Nasi Goreng Spesial"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MenuCategory }))}
              className="input-field"
            >
              <option value="MAKANAN">🍽️ Makanan</option>
              <option value="MINUMAN">🥤 Minuman</option>
              <option value="SNACK">🍿 Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga (Rp)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="Contoh: 25000"
              className="input-field"
              min="0"
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <input
              type="checkbox"
              id="isAvailable"
              checked={form.isAvailable}
              onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
              className="w-4 h-4 accent-orange-600"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
              Tersedia / Aktif
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : editItem ? 'Simpan' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Hapus Menu"
        message={`Yakin ingin menghapus menu "${deleteItem?.name}"?`}
        confirmLabel="Hapus Menu"
        isLoading={isDeleting}
      />
    </div>
  )
}
