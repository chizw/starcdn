'use client'

import * as React from 'react'
import { cn } from '@/app/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full px-3.5 py-2.5 border border-line rounded-xl bg-surface-strong/60 text-foreground text-[0.94rem] font-body placeholder:text-muted focus:outline-none focus:border-moss focus:ring-2 focus:ring-moss/15 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
