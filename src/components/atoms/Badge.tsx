import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isAnimated?: boolean;
  showDot?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

const dotColors = {
  default: 'bg-gray-500',
  primary: 'bg-primary-500',
  secondary: 'bg-purple-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-0.5 text-sm gap-1.5',
  lg: 'px-3 py-1 text-base gap-2',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function Badge({
  children,
  className,
  variant = 'default',
  size = 'md',
  isAnimated = false,
  showDot = false,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-all duration-200';

  const dotElement = showDot && (
    <span className={cn('rounded-full', dotSizes[size], dotColors[variant])} />
  );

  if (isAnimated) {
    return (
      <motion.span
        className={cn(baseStyles, badgeVariants[variant], badgeSizes[size], className)}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {dotElement}
        {children}
      </motion.span>
    );
  }

  return (
    <span className={cn(baseStyles, badgeVariants[variant], badgeSizes[size], className)}>
      {dotElement}
      {children}
    </span>
  );
}

export interface StatusBadgeProps {
  status: 'active' | 'beta' | 'preparing' | 'maintenance' | 'deprecated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusVariantMap: Record<StatusBadgeProps['status'], BadgeProps['variant']> = {
  active: 'success',
  beta: 'warning',
  preparing: 'info',
  maintenance: 'warning',
  deprecated: 'default',
};

const statusLabels: Record<StatusBadgeProps['status'], string> = {
  active: '已上线',
  beta: 'Beta',
  preparing: '准备中',
  maintenance: '维护中',
  deprecated: '已停用',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]} size={size} showDot className={className}>
      {statusLabels[status]}
    </Badge>
  );
}

export interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const difficultyVariantMap: Record<DifficultyBadgeProps['difficulty'], BadgeProps['variant']> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
};

const difficultyLabels: Record<DifficultyBadgeProps['difficulty'], string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export function DifficultyBadge({ difficulty, size = 'sm', className }: DifficultyBadgeProps) {
  return (
    <Badge variant={difficultyVariantMap[difficulty]} size={size} showDot className={className}>
      {difficultyLabels[difficulty]}
    </Badge>
  );
}
