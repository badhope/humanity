import { motion } from 'framer-motion';
import { cn } from '@/shared/utils';
import { Clock } from 'lucide-react';
import type { AssessmentRegistryItem } from '@/shared/types';

interface AssessmentCardProps {
  assessment: AssessmentRegistryItem;
  onClick?: () => void;
  className?: string;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function AssessmentCard({ assessment, onClick, className }: AssessmentCardProps) {
  const content = (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {assessment.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {assessment.shortDescription}
          </p>
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', difficultyColors[assessment.difficulty])}>
          {assessment.difficulty === 'easy' ? '简单' : assessment.difficulty === 'medium' ? '中等' : '困难'}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{assessment.estimatedMinutes} 分钟</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>📝</span>
          <span>{assessment.questionCount} 题</span>
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn('cursor-pointer', className)}
        onClick={onClick}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 border border-gray-200 dark:border-gray-700">
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700', className)}>
      {content}
    </div>
  );
}
