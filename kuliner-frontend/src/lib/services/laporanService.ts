import api from '@/lib/api'
import { LaporanResponse } from '@/types'

export const laporanService = {
  getSummary: async (params?: { startDate?: string; endDate?: string }) => {
    const { data } = await api.get<{ message: string; data: LaporanResponse }>('/laporan', { params })
    return data
  },
}
