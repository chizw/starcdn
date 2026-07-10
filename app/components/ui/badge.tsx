import * as React from 'react'
import { cn } from '@/app/lib/utils'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-moss text-white',
    secondary: 'bg-secondary text-foreground',
    destructive: 'bg-clay/10 text-clay border border-clay/40',
    outline: 'border border-line text-foreground',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
