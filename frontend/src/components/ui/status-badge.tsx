// src/components/ui/status-badge.tsx
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

interface StatusBadgeProps {
  status: 'pending' | 'uploading' | 'success' | 'error' | 'processing'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'outline' as const },
    uploading: { label: 'Uploading', variant: 'info' as const },
    processing: { label: 'Processing', variant: 'info' as const },
    success: { label: 'Success', variant: 'success' as const },
    error: { label: 'Error', variant: 'destructive' as const }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {status === 'uploading' || status === 'processing' ? (
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
          <span>{config.label}</span>
        </div>
      ) : (
        config.label
      )}
    </Badge>
  )
}
// status-badge.tsx placeholder
