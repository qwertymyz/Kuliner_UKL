'use client'

import { useState, useEffect } from 'react'
import { laporanService } from '@/lib/services/laporanService'
import { LaporanResponse } from '@/types'
import { formatRupiah, formatDateShort } from '@/lib/utils'
import StatsCard from '@/components/ui/StatsCard'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, ShoppingBag, DollarSign, CalendarCheck, Trophy } from 'lucide-react'

const PIE_COLORS = ['#ea580c', '#3b82f6', '#a855f7']

export default function AdminLaporanPage() {
  const [laporan, setLaporan] = useState<LaporanResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadLaporan = async () => {
    setIsLoading(true)
    try {
      const res = await laporanService.getSummary({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setLaporan(res.data)
    } catch {
      toast.error('Gagal memuat laporan')
    } finally {
      setIsLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadLaporan() }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Laporan Transaksi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Statistik penjualan</p>
        </div>
        {/* Date filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field w-auto text-sm"
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field w-auto text-sm"
          />
          <button onClick={loadLaporan} className="btn-primary px-4 py-2.5 text-sm">
            Filter
          </button>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setTimeout(loadLaporan, 50) }}
              className="btn-secondary px-4 py-2.5 text-sm"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Transaksi"
              value={String(laporan?.summary.totalTransaksi ?? 0)}
              icon={ShoppingBag}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Total Pendapatan"
              value={formatRupiah(laporan?.summary.totalPendapatan ?? 0)}
              icon={DollarSign}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Transaksi Hari Ini"
              value={String(laporan?.summary.transaksiHariIni ?? 0)}
              icon={CalendarCheck}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
            <StatsCard
              title="Pendapatan Hari Ini"
              value={formatRupiah(laporan?.summary.pendapatanHariIni ?? 0)}
              icon={TrendingUp}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Line chart pendapatan */}
            <div className="card lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-900 mb-4 font-display">Tren Pendapatan Harian</h3>
              {laporan?.dailyRevenue && laporan.dailyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={laporan.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v: number) => [formatRupiah(v), 'Pendapatan']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #fed7aa', fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#ea580c"
                      strokeWidth={2.5}
                      dot={{ fill: '#ea580c', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Belum ada data</div>
              )}
            </div>

            {/* Pie chart kategori */}
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 mb-4 font-display">Kategori Terlaris</h3>
              {laporan?.categorySales && laporan.categorySales.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={laporan.categorySales}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ category, percent }) =>
                        `${category} ${Math.round((percent ?? 0) * 100)}%`
                      }
                      labelLine={false}
                    >
                      {laporan.categorySales.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Belum ada data</div>
              )}
            </div>
          </div>

          {/* Top menu items */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4 font-display flex items-center gap-2">
              <Trophy size={16} className="text-orange-600" />
              Menu Terlaris
            </h3>
            {laporan?.topItems && laporan.topItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header text-left">#</th>
                      <th className="table-header text-left">Nama Menu</th>
                      <th className="table-header text-left">Kategori</th>
                      <th className="table-header text-right">Terjual</th>
                      <th className="table-header text-right">Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.topItems.map((item, i) => (
                      <tr key={item.menuItemId} className="hover:bg-orange-50/50 transition-colors">
                        <td className="table-cell font-bold text-gray-400">#{i + 1}</td>
                        <td className="table-cell font-medium text-gray-900">{item.name}</td>
                        <td className="table-cell">
                          <span className="badge-default">
                            {item.category === 'MAKANAN' ? '🍽️' : item.category === 'MINUMAN' ? '🥤' : '🍿'} {item.category}
                          </span>
                        </td>
                        <td className="table-cell text-right font-semibold text-gray-900">{item.totalSold}</td>
                        <td className="table-cell text-right font-semibold text-orange-600">
                          {formatRupiah(item.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada data penjualan</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
