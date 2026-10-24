import type { PriorityLevel } from '../types/notes'
import { PRIORITY_CONFIG } from '../types/notes'

interface PriorityBadgeProps {
  priority: PriorityLevel
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  const Icon = config.icon

  return (
    <span className={`priority-badge ${config.badgeClass} size-${size}`} title={config.description}>
      <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />
      <span>{config.shortLabel}</span>
    </span>
  )
}
