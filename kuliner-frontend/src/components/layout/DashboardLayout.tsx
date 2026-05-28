'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, UtensilsCrossed, BarChart3,
  ShoppingCart, History, LogOut, ChefHat, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Kelola User', href: '/admin/users', icon: Users },
  { label: 'Kelola Menu', href: '/admin/menu', icon: UtensilsCrossed },
  { label: 'Laporan', href: '/admin/laporan', icon: BarChart3 },
]

const kasirNavItems: NavItem[] = [
  { label: 'Transaksi', href: '/kasir/transaksi', icon: ShoppingCart },
  { label: 'Riwayat', href: '/kasir/riwayat', icon: History },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navItems = isAdmin ? adminNavItems : kasirNavItems

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-orange-100 hover:text-orange-700'
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-orange-100">
        <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-sm">
          <ChefHat className="text-white" size={20} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight font-display">Kuliner POS</p>
          <p className="text-xs text-gray-400">Sistem Kasir</p>
        </div>
      </div>

      <NavLinks />

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-orange-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-orange-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-orange-200 flex items-center justify-center shrink-0">
            <span className="text-orange-800 text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-orange-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-orange-100 shrink-0 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-white shadow-xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-4 bg-white border-b border-orange-100 px-4 py-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="text-orange-600" size={20} />
            <span className="font-bold text-gray-900 font-display text-sm">Kuliner POS</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
