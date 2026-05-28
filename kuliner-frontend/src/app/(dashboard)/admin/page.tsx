'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { laporanService } from '@/lib/services/laporanService'
import { LaporanResponse } from '@/types'
import { formatRupiah } from '@/lib/utils'
import StatsCard from '@/components/ui/StatsCard'
import Spinner from '@/components/ui/Spinner'
import {
  TrendingUp, ShoppingBag, DollarSign, CalendarCheck,
  UtensilsCrossed, Users,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [laporan, setLaporan] = useState<LaporanResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await laporanService.getSummary()
        setLaporan(res.data)
      } catch {
        // silently fail, show empty state
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Selamat datang, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan sistem kasir hari ini</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatsCard
              title="Total Transaksi"
              value={String(laporan?.summary.totalTransaksi ?? 0)}
              subtitle="Semua waktu"
              icon={ShoppingBag}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Total Pendapatan"
              value={formatRupiah(laporan?.summary.totalPendapatan ?? 0)}
              subtitle="Semua waktu"
              icon={DollarSign}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Transaksi Hari Ini"
              value={String(laporan?.summary.transaksiHariIni ?? 0)}
              subtitle="Per hari ini"
              icon={CalendarCheck}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
            <StatsCard
              title="Pendapatan Hari Ini"
              value={formatRupiah(laporan?.summary.pendapatanHariIni ?? 0)}
              subtitle="Per hari ini"
              icon={TrendingUp}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            {/* Revenue chart */}
            <div className="card lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-900 mb-4 font-display">
                Pendapatan 7 Hari Terakhir
              </h3>
              {laporan?.dailyRevenue && laporan.dailyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={laporan.dailyRevenue} barSize={20}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v: number) => [formatRupiah(v), 'Pendapatan']}
                      contentStyle={{
                        borderRadius: '12px', border: '1px solid #fed7aa',
                        fontSize: '12px', fontFamily: 'inherit',
                      }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {laporan.dailyRevenue.map((_, i) => (
                        <Cell key={i} fill={i === laporan.dailyRevenue.length - 1 ? '#ea580c' : '#fed7aa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data transaksi
                </div>
              )}
            </div>

            {/* Category sales */}
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 mb-4 font-display">
                Penjualan per Kategori
              </h3>
              <div className="space-y-3">
                {laporan?.categorySales?.map((cat) => {
                  const total = laporan.categorySales.reduce((a, b) => a + b.total, 0)
                  const pct = total > 0 ? Math.round((cat.total / total) * 100) : 0
                  const colorMap: Record<string, string> = {
                    MAKANAN: 'bg-orange-400',
                    MINUMAN: 'bg-blue-400',
                    SNACK: 'bg-purple-400',
                  }
                  const emojiMap: Record<string, string> = {
                    MAKANAN: '🍽️', MINUMAN: '🥤', SNACK: '🍿',
                  }
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {emojiMap[cat.category]} {cat.category}
                        </span>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colorMap[cat.category] ?? 'bg-orange-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {(!laporan?.categorySales || laporan.categorySales.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-6">Belum ada data</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/admin/users" className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4 cursor-pointer">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Kelola User</p>
                <p className="text-xs text-gray-500">Tambah & atur kasir</p>
              </div>
            </Link>
            <Link href="/admin/menu" className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4 cursor-pointer">
              <div className="p-3 bg-orange-100 rounded-xl">
                <UtensilsCrossed className="text-orange-600" size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Kelola Menu</p>
                <p className="text-xs text-gray-500">Tambah & atur menu</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
