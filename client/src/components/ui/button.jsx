import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn.js'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/20 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-brand-900 bg-brand-900 text-white',
        secondary: 'border-line bg-[#eef1f5] text-ink-950',
        ghost: 'border-transparent bg-transparent text-ink-700',
        subtle: 'border-brand-100 bg-brand-50 text-brand-800',
        outline: 'border-line bg-white text-ink-800',
        danger: 'border-red-600 bg-red-600 text-white',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5 text-[15px]',
        icon: 'h-10 w-10',
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
