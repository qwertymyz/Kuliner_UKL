'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Shield, UserCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import { userService, CreateUserPayload, UpdateUserPayload } from '@/lib/services/userService'
import { User } from '@/types'
import { formatDate, getErrorMessage } from '@/lib/utils'

type UserForm = { name: string; username: string; password: string; role: 'ADMIN' | 'KASIR' }
const defaultForm: UserForm = { name: '', username: '', password: '', role: 'KASIR' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(defaultForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await userService.getAll({ search: search || undefined })
      setUsers(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300)
    return () => clearTimeout(timer)
  }, [loadUsers])

  const openCreate = () => {
    setEditUser(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({ name: u.name, username: u.username, password: '', role: u.role })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.username) {
      toast.error('Nama dan username wajib diisi')
      return
    }
    if (!editUser && !form.password) {
      toast.error('Password wajib diisi saat membuat user baru')
      return
    }
    setIsSaving(true)
    try {
      if (editUser) {
        const payload: UpdateUserPayload = { name: form.name, username: form.username, role: form.role }
        if (form.password) payload.password = form.password
        await userService.update(editUser.id, payload)
        toast.success('User berhasil diperbarui')
      } else {
        const payload: CreateUserPayload = { name: form.name, username: form.username, password: form.password, role: form.role }
        await userService.create(payload)
        toast.success('User berhasil dibuat')
      }
      setModalOpen(false)
      loadUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setIsDeleting(true)
    try {
      await userService.delete(deleteUser.id)
      toast.success('User berhasil dihapus')
      setDeleteUser(null)
      loadUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Kelola User</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manajemen akun admin dan kasir</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari user..."
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left rounded-tl-2xl">Nama</th>
                <th className="table-header text-left">Username</th>
                <th className="table-header text-left">Role</th>
                <th className="table-header text-left">Dibuat</th>
                <th className="table-header text-right rounded-tr-2xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={UserCircle}
                      title="Belum ada user"
                      description="Tambahkan user pertama dengan menekan tombol di atas"
                    />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="table-cell font-medium text-gray-900">{u.name}</td>
                    <td className="table-cell text-gray-500 font-mono text-xs">{u.username}</td>
                    <td className="table-cell">
                      <span className={u.role === 'ADMIN' ? 'badge-info' : 'badge-default'}>
                        {u.role === 'ADMIN' ? (
                          <><Shield size={10} className="mr-1" />Admin</>
                        ) : (
                          <><UserCircle size={10} className="mr-1" />Kasir</>
                        )}
                      </span>
                    </td>
                    <td className="table-cell text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteUser(u)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Edit User' : 'Tambah User Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Masukkan nama lengkap"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="Masukkan username"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password {editUser && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={editUser ? 'Password baru (opsional)' : 'Masukkan password'}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'ADMIN' | 'KASIR' }))}
              className="input-field"
            >
              <option value="KASIR">Kasir</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : editUser ? 'Simpan Perubahan' : 'Buat User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Hapus User"
        message={`Yakin ingin menghapus user "${deleteUser?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus User"
        isLoading={isDeleting}
      />
    </div>
  )
}
