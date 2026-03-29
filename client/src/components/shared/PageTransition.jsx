import { motion, useReducedMotion } from 'framer-motion'
import { childReveal, pageReveal } from '../../utils/motion.js'

export function PageTransition({ children, className = '' }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      animate="animate"
      className={className}
      initial="initial"
      variants={pageReveal}
    >
      {children}
    </motion.div>
  )
}

export function Reveal({ children, className = '' }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={childReveal}>
      {children}
    </motion.div>
  )
}
