import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn.js'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-brand-800 to-brand-700 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-float',
        secondary:
          'border border-line bg-white text-ink-950 shadow-soft hover:-translate-y-0.5 hover:bg-brand-50',
        ghost: 'text-ink-700 hover:bg-brand-50 hover:text-brand-900',
        subtle: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
        outline: 'border border-line bg-transparent text-ink-800 hover:bg-white',
        danger: 'bg-red-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-red-700',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 px-5 text-[15px]',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const Button = forwardRef(function Button(
  { className, type = 'button', variant, size, ...props },
  ref,
) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      type={type}
      {...props}
    />
  )
})
