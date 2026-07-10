import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'success' | 'destructive' | 'outline';
};

const variants = {
  default: 'bg-zinc-950 text-zinc-50',
  secondary: 'bg-zinc-100 text-zinc-700',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  destructive: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  outline: 'border border-zinc-200 text-zinc-700',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  );
}
