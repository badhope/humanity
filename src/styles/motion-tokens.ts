import { type Variant, type Transition } from 'framer-motion';

export type AnimationLevel = 'none' | 'low' | 'medium' | 'high';

export const motionConfig = {
  none: {
    duration: 0,
    staggerChildren: 0,
  },
  low: {
    duration: 0.2,
    staggerChildren: 0.05,
  },
  medium: {
    duration: 0.35,
    staggerChildren: 0.08,
  },
  high: {
    duration: 0.5,
    staggerChildren: 0.12,
  },
} as const;

export const easing = {
  default: [0.4, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  elastic: [0.68, -0.6, 0.32, 1.6] as const,
  smooth: [0.22, 1, 0.36, 1] as const,
} as const;

export const transitions = {
  fast: {
    duration: 0.15,
    ease: easing.default,
  },
  normal: {
    duration: 0.25,
    ease: easing.default,
  },
  slow: {
    duration: 0.4,
    ease: easing.smooth,
  },
  spring: {
    duration: 0.5,
    ease: easing.bounce,
  },
} as const;

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easing.easeIn,
    },
  },
} as const;

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

export const fadeUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
} as const;

export const fadeDownVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
} as const;

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
} as const;

export const slideInFromRightVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
} as const;

export const slideInFromLeftVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
} as const;

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easing.smooth,
    },
  },
} as const;

export const cardHoverVariants = {
  initial: { y: 0, boxShadow: 'var(--shadow-card)' },
  hover: {
    y: -4,
    boxShadow: 'var(--shadow-card-hover)',
    transition: {
      duration: 0.25,
      ease: easing.default,
    },
  },
} as const;

export const buttonTapVariants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.97,
    transition: {
      duration: 0.1,
      ease: easing.default,
    },
  },
} as const;

export const iconBounceVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: easing.bounce,
    },
  },
} as const;

export type MotionVariant = Variant;
export type MotionTransition = Transition;
