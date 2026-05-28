'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAdmin: boolean
  isKasir: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = Cookies.get('token')
    const storedUser = Cookies.get('user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        Cookies.remove('token')
        Cookies.remove('user')
      }
    }
    setIsLoading(false)
  }, [])

  const setAuth = useCallback((userData: User, tokenData: string) => {
    setUser(userData)
    setToken(tokenData)
    Cookies.set('token', tokenData, { expires: 1, secure: false, sameSite: 'lax' })
    Cookies.set('user', JSON.stringify(userData), { expires: 1, secure: false, sameSite: 'lax' })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    Cookies.remove('token')
    Cookies.remove('user')
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        setAuth,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isKasir: user?.role === 'KASIR',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
