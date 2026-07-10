import * as React from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

const variants = {
  default: 'bg-zinc-950 text-zinc-50 shadow-sm hover:bg-zinc-800',
  secondary: 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200',
  outline: 'border border-zinc-200 bg-white text-zinc-950 shadow-sm hover:bg-zinc-50',
  ghost: 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950',
  destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-lg px-3 text-xs',
  lg: 'h-11 rounded-xl px-6',
  icon: 'h-10 w-10',
};

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
