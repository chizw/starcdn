'use client'

import * as React from 'react'
import { cn } from '@/app/lib/utils'

const buttonVariants = ({
  variant = 'default',
  size = 'default',
}: {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
} = {}) => {
  const base = 'inline-flex items-center justify-center rounded-full font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'

  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'border border-line bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-line bg-transparent',
    ghost: 'bg-transparent',
  }

  const sizes: Record<string, string> = {
    default: 'h-10 px-5 py-2',
    sm: 'h-8 px-3.5 text-sm',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10',
  }

  return cn(base, variants[variant], sizes[size])
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(props.children)) {
      const child = props.children as React.ReactElement<Record<string, unknown>>
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size }), className, child.props.className as string),
        ref,
        ...props,
        children: child.props.children,
      })
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
