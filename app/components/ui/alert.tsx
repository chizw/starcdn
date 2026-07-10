import * as React from 'react';
import { cn } from '../../lib/utils';

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'success' | 'destructive';
};

const variants = {
  default: 'border-zinc-200 bg-white text-zinc-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  destructive: 'border-red-200 bg-red-50 text-red-800',
};

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return <div className={cn('rounded-xl border px-4 py-3 text-sm', variants[variant], className)} {...props} />;
}
