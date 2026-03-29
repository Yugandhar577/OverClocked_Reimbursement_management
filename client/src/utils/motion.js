export const easeOutExpo = [0.22, 1, 0.36, 1]

export const pageReveal = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: easeOutExpo,
      staggerChildren: 0.06,
    },
  },
}

export const childReveal = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: easeOutExpo,
    },
  },
}
