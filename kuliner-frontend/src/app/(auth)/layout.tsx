import { AuthProvider } from '@/context/AuthContext'

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
