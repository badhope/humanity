import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useSettingsStore } from '@/store/settingsStore';

export interface ButtonProps {
  variant?: 'primary' | 'primary-glow' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  isAnimated?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-button hover:shadow-button-hover focus:ring-primary-500',
  'primary-glow': 'bg-primary-500 text-white hover:bg-primary-600 shadow-button hover:shadow-button-hover glow-primary focus:ring-primary-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
  outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50 hover:border-primary-600 hover:text-primary-600 focus:ring-primary-500 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2 rounded-lg',
};

const tapVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.97 },
};

const glowVariants = {
  initial: { opacity: 0 },
  hover: { opacity: 1 },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      isAnimated = true,
      ...props
    },
    ref
  ) => {
    const { animationLevel, reducedMotion } = useSettingsStore();
    const shouldAnimate = isAnimated && animationLevel !== 'none' && !reducedMotion;

    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'select-none overflow-hidden'
    );

    const motionProps = shouldAnimate
      ? {
          whileHover: variant === 'primary-glow' ? { scale: 1.02 } : undefined,
          whileTap: 'tap',
          initial: 'initial',
          animate: 'animate',
        }
      : {};

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, buttonVariants[variant], buttonSizes[size], className)}
        disabled={disabled || isLoading}
        variants={shouldAnimate ? tapVariants : undefined}
        {...motionProps}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
        {variant === 'primary-glow' && shouldAnimate && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            variants={glowVariants}
            initial="initial"
            whileHover="hover"
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-primary-600/20 blur-xl" />
          </motion.div>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
