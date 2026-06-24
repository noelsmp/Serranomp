import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans border',
        {
          'bg-green-50 text-green-800 border-green-200': variant === 'success',
          'bg-amber-50 text-amber-800 border-amber-200': variant === 'warning',
          'bg-red-50 text-red-800 border-red-200': variant === 'danger',
          'bg-blue-50 text-blue-800 border-blue-200': variant === 'info',
          'bg-stone-50 text-stone-700 border-stone-200': variant === 'neutral',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
