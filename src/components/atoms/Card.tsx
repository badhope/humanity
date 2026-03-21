import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { useSettingsStore } from '@/store/settingsStore';

export interface CardProps {
  variant?: 'default' | 'hover' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isAnimated?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const hoverVariants = {
  initial: { y: 0, boxShadow: 'var(--shadow-card)', borderColor: 'rgb(226 232 240 / 0.8)' },
  hover: {
    y: -4,
    boxShadow: 'var(--shadow-card-hover)',
    borderColor: 'var(--color-primary-light)',
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

const glassVariants = {
  initial: {
    backgroundColor: 'rgb(255 255 255 / 0.8)',
    backdropFilter: 'blur(12px)',
    borderColor: 'rgb(226 232 240 / 0.5)',
  },
  hover: {
    backgroundColor: 'rgb(255 255 255 / 0.95)',
    borderColor: 'rgb(165 180 252 / 0.5)',
    transition: { duration: 0.2 },
  },
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = 'default', padding = 'md', isAnimated = true, onClick, ...props }, ref) => {
    const { animationLevel, reducedMotion } = useSettingsStore();
    const shouldAnimate = isAnimated && animationLevel !== 'none' && !reducedMotion;

    const baseStyles = 'rounded-xl transition-all duration-200';

    const variantStyles = {
      default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
      hover: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
      glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg',
      outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
    };

    const motionProps = shouldAnimate && variant === 'hover'
      ? {
          initial: hoverVariants.initial,
          whileHover: 'hover',
        }
      : {};

    const glassMotionProps = shouldAnimate && variant === 'glass'
      ? {
          initial: glassVariants.initial,
          whileHover: 'hover',
        }
      : {};

    const motionVariants = variant === 'hover' ? hoverVariants : variant === 'glass' ? glassVariants : undefined;

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
        variants={motionVariants}
        onClick={onClick}
        {...motionProps}
        {...glassMotionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
