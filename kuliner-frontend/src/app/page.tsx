import Link from 'next/link';
import { ArrowRight, Coffee, BarChart3, Users, Zap, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-orange-200 selection:text-orange-900 font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob" style={{ animationDelay: '2000ms' }} />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob" style={{ animationDelay: '4000ms' }} />
      </div>

      {/* Navigation - Glassmorphism */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Coffee className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600">
              Kuliner-UKL
            </span>
          </div>
          <Link
            href="/login"
            className="group relative px-6 py-2.5 font-semibold text-white rounded-full bg-slate-900 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-300"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              Masuk Sistem <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mt-10 md:mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-medium text-sm mb-8 ring-1 ring-orange-200/50 shadow-sm animate-fade-in-up">
            <Zap size={16} className="text-orange-500" />
            <span>Sistem Kasir Modern v2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Kelola Restoran Anda dengan{' '}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500">
                Lebih Cerdas
              </span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Kuliner-UKL memberikan Anda kendali penuh atas manajemen menu, transaksi kasir, hingga laporan penjualan real-time dalam satu dashboard yang elegan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 w-full">
          <FeatureCard
            icon={<Coffee size={28} className="text-orange-500" />}
            title="Manajemen Menu Pintar"
            description="Atur kategori, harga, dan ketersediaan menu makanan & minuman dengan antarmuka yang sangat mudah digunakan."
            delay="400ms"
          />
          <FeatureCard
            icon={<Zap size={28} className="text-rose-500" />}
            title="Transaksi Super Cepat"
            description="Sistem point-of-sale (POS) yang dirancang untuk kecepatan tinggi, meminimalkan antrean di kasir Anda."
            delay="500ms"
          />
          <FeatureCard
            icon={<BarChart3 size={28} className="text-amber-500" />}
            title="Laporan Real-time"
            description="Pantau pendapatan harian, menu terlaris, dan analitik bisnis secara langsung melalui grafik interaktif."
            delay="600ms"
          />
        </div>

        {/* Mini Preview Section */}
        <div className="mt-32 w-full max-w-5xl bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl p-4 md:p-8 shadow-2xl shadow-slate-200/50 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-6">
              <h3 className="text-2xl font-bold text-slate-800">Didesain untuk Efisiensi</h3>
              <ul className="space-y-4">
                {[
                  'Desain antarmuka yang intuitif dan bersih',
                  'Aman dengan Autentikasi JWT',
                  'Responsif di berbagai perangkat',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
              {/* Mockup UI Elements */}
              <div className="h-8 w-1/3 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-32 w-full bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-center">
                <BarChart3 className="text-orange-300" size={48} />
              </div>
              <div className="flex gap-4">
                <div className="h-24 flex-1 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-24 flex-1 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-md relative z-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Coffee size={20} className="text-orange-500" /> Kuliner-UKL
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Sistem Kasir Kuliner. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: string }) {
  return (
    <div 
      className="group p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
