'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layout/AuthLayout'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/lib/services/authService'
import { getErrorMessage } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Username dan password wajib diisi')
      return
    }
    setIsLoading(true)
    try {
      const res = await authService.login(form)
      setAuth(res.user, res.token)
      toast.success(`Selamat datang, ${res.user.name}!`)
      if (res.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/kasir/transaksi')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 animate-scale-in">
        <h2 className="text-xl font-bold text-gray-900 mb-1 font-display">Masuk ke Sistem</h2>
        <p className="text-gray-500 text-sm mb-6">Masukkan kredensial akun Anda</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="Masukkan username"
              className="input-field"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Masukkan password"
                className="input-field pr-11"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Masuk...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Proyek UKL — Sistem Kasir Kuliner
        </p>
      </div>
    </AuthLayout>
  )
}
