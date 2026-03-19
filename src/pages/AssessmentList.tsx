import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '@/components/molecules';
import { Button, Card, Badge } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import { ASSESSMENT_CATEGORIES } from '@/shared/constants';
import { getAssessmentsByCategory } from '@/features/assessment/registry';
import type { AssessmentRegistryItem, AssessmentCategory } from '@/shared/types';

const AssessmentList: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { animationLevel, reducedMotion } = useSettingsStore();
  const [assessments, setAssessments] = useState<AssessmentRegistryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      if (!category) {
        setLoading(false);
        return;
      }

      try {
        const data = await getAssessmentsByCategory(category as AssessmentCategory);
        setAssessments(data);
      } catch (error) {
        console.error('Failed to load assessments:', error);
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    }

    loadAssessments();
  }, [category]);

  const categoryInfo = category ? ASSESSMENT_CATEGORIES[category as keyof typeof ASSESSMENT_CATEGORIES] : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion || animationLevel === 'none' ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="grid gap-6 sm:grid-cols-2 mt-8">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/categories')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-6"
          >
            返回分类
          </Button>

          {categoryInfo && (
            <>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
              >
                {categoryInfo.name}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8 text-lg text-gray-600 dark:text-gray-400"
              >
                {categoryInfo.description}
              </motion.p>
            </>
          )}

          <motion.div
            className="grid gap-6 sm:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {assessments.map((assessment) => (
              <motion.div key={assessment.id} variants={itemVariants}>
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full"
                  onClick={() => navigate(`/quiz/${assessment.slug}`)}
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {assessment.name}
                      </h3>
                      <Badge className={difficultyColors[assessment.difficulty]}>
                        {assessment.difficulty === 'easy' ? '简单' :
                         assessment.difficulty === 'medium' ? '中等' : '困难'}
                      </Badge>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                      {assessment.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {assessment.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <span>⏱</span> {assessment.estimatedMinutes} 分钟
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📝</span> {assessment.questionCount} 题
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {assessments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">该分类下暂无测评</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AssessmentList;
