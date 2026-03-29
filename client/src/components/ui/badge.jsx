import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn.js'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-900',
        aqua: 'bg-aqua-100 text-aqua-700',
        amber: 'bg-amber-100 text-amber-700',
        success: 'bg-emerald-100 text-emerald-700',
        danger: 'bg-red-100 text-red-700',
        muted: 'bg-[#f0f2f5] text-[#5f6875]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
