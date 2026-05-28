import Link from 'next/link'
import { ChefHat } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
        <ChefHat className="text-orange-500" size={40} />
      </div>
      <h1 className="text-6xl font-bold text-orange-600 font-display mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 mb-8 max-w-xs">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/login" className="btn-primary inline-flex items-center gap-2">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
