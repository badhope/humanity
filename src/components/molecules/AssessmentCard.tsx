import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { Clock, FileText, ChevronRight } from 'lucide-react';
import type { AssessmentRegistryItem } from '@/shared/types';
import { DifficultyBadge } from '@/components/atoms/Badge';
import { useSettingsStore } from '@/store/settingsStore';

interface AssessmentCardProps {
  assessment: AssessmentRegistryItem;
  onClick?: () => void;
  className?: string;
  isAnimated?: boolean;
}

const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  hover: {
    y: -4,
    boxShadow: 'var(--shadow-card-hover)',
    borderColor: 'var(--color-primary-light)',
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export function AssessmentCard({
  assessment,
  onClick,
  className,
  isAnimated = true,
}: AssessmentCardProps) {
  const { animationLevel, reducedMotion } = useSettingsStore();
  const shouldAnimate = isAnimated && animationLevel !== 'none' && !reducedMotion;

  const content = (
    <div className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {assessment.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {assessment.shortDescription}
            </p>
          </div>
          <DifficultyBadge difficulty={assessment.difficulty} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>{assessment.estimatedMinutes} 分钟</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary-500" />
            <span>{assessment.questionCount} 题</span>
          </div>
        </div>

        {assessment.tags && assessment.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {assessment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {assessment.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500">
                +{assessment.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {onClick && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-500">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent dark:from-primary-900/10 dark:to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );

  const baseClasses = cn(
    'relative bg-white dark:bg-gray-800 rounded-xl',
    'border border-gray-100 dark:border-gray-700',
    'p-5',
    'transition-all duration-200 ease-out',
    'cursor-pointer group'
  );

  if (onClick && shouldAnimate) {
    return (
      <motion.div
        className={cn(baseClasses, 'shadow-card', className)}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        'hover:shadow-card-hover hover:border-primary-light hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      {content}
    </div>
  );
}
