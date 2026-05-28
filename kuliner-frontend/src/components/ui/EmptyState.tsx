import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
        <Icon className="text-orange-500" size={28} />
      </div>
      <h3 className="text-gray-900 font-semibold text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-xs mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
