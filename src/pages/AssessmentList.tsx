import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Star, ChevronRight } from 'lucide-react';
import { PageTransition } from '@/components/molecules';
import { Button, Card, Badge } from '@/components/atoms';
import { VersionSelector } from '@/components/assessment/VersionSelector';
import { useSettingsStore } from '@/store/settingsStore';
import { ASSESSMENT_CATEGORIES } from '@/shared/constants';
import {
  getAssessmentsByCategory,
  getAllFamilies,
} from '@/features/assessment/registry';
import type {
  AssessmentRegistryItem,
  AssessmentCategory,
  AssessmentFamily,
  VersionInfo,
} from '@/shared/types';

const COMPLETED_MODULES = [
  'mbti-basic',
  'stress-check',
  'resilience-basic',
  'logic-lite',
  'focus-style',
  'values-spectrum',
  'holland-basic',
  'work-style-basic',
];

const FAMILY_IDS_WITH_VERSIONS = [
  'mbti',
  'stress-check',
  'resilience',
  'logic',
  'focus',
  'values',
  'holland',
  'work-style',
];

const AssessmentList: FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { animationLevel, reducedMotion } = useSettingsStore();
  const [assessments, setAssessments] = useState<AssessmentRegistryItem[]>([]);
  const [families, setFamilies] = useState<AssessmentFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<AssessmentFamily | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!category) {
        setLoading(false);
        return;
      }

      try {
        const [assessmentsData, familiesData] = await Promise.all([
          getAssessmentsByCategory(category as AssessmentCategory),
          getAllFamilies(),
        ]);
        const categoryFamilies = familiesData.filter(f => f.category === category);
        setAssessments(assessmentsData);
        setFamilies(categoryFamilies);
      } catch (error) {
        console.error('Failed to load assessments:', error);
        setAssessments([]);
        setFamilies([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [category]);

  const categoryInfo = category ? ASSESSMENT_CATEGORIES[category as keyof typeof ASSESSMENT_CATEGORIES] : null;

  const hasFamilyVersions = (familyId: string) => FAMILY_IDS_WITH_VERSIONS.includes(familyId);

  const handleFamilyClick = async (family: AssessmentFamily) => {
    if (hasFamilyVersions(family.familyId)) {
      setSelectedFamily(family);
    } else {
      const assessment = assessments.find(a => a.familyId === family.familyId);
      if (assessment && COMPLETED_MODULES.includes(assessment.slug)) {
        navigate(`/quiz/${assessment.slug}`);
      } else if (assessment) {
        navigate(`/maintenance?module=${assessment.slug}&name=${encodeURIComponent(assessment.name)}`);
      }
    }
  };

  const handleVersionSelect = (_version: VersionInfo, slug: string) => {
    navigate(`/quiz/${slug}`);
  };

  const handleBackFromVersion = () => {
    setSelectedFamily(null);
  };

  const handleAssessmentClick = (assessment: AssessmentRegistryItem) => {
    if (COMPLETED_MODULES.includes(assessment.slug)) {
      navigate(`/quiz/${assessment.slug}`);
    } else {
      navigate(`/maintenance?module=${assessment.slug}&name=${encodeURIComponent(assessment.name)}`);
    }
  };

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

  const versionColors = {
    lite: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    expert: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
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

  if (selectedFamily) {
    return (
      <PageTransition>
        <VersionSelector
          family={selectedFamily}
          onSelectVersion={handleVersionSelect}
          onBack={handleBackFromVersion}
        />
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

          {families.length > 0 ? (
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {families.map((family) => {
                const hasVersions = hasFamilyVersions(family.familyId);
                const recommendedVersion = family.versions.find(v => v.recommended);
                const isMultiVersion = hasVersions;

                return (
                  <motion.div key={family.familyId} variants={itemVariants}>
                    <Card
                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 h-full ${
                        isMultiVersion ? 'border-2 border-blue-200 dark:border-blue-800' : ''
                      }`}
                      onClick={() => handleFamilyClick(family)}
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {family.familyName}
                          </h3>
                          {isMultiVersion && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              <Star className="w-3 h-3 mr-1" />
                              多版本
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow text-sm">
                          {family.shortDescription}
                        </p>

                        {isMultiVersion && recommendedVersion && (
                          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                推荐版本
                              </span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {recommendedVersion.name} · {recommendedVersion.questionCount}题 · {recommendedVersion.estimatedMinutes}分钟
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {family.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            {family.versions[0] && (
                              <span className="flex items-center gap-1">
                                <span>⏱</span> {family.versions[0].estimatedMinutes}-{family.versions[family.versions.length - 1].estimatedMinutes} 分钟
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-blue-500 text-sm font-medium">
                            {isMultiVersion ? (
                              <>
                                选择版本
                                <ChevronRight className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                开始
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </div>
                        </div>

                        {isMultiVersion && (
                          <div className="mt-4 flex gap-2">
                            {family.versions.map(v => (
                              <span
                                key={v.level}
                                className={`text-xs px-2 py-0.5 rounded-full ${versionColors[v.level]}`}
                              >
                                {v.level === 'lite' ? '简单' : v.level === 'standard' ? '标准' : '专家'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6 sm:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {assessments.map((assessment) => {
                const isCompleted = COMPLETED_MODULES.includes(assessment.slug);
                return (
                  <motion.div key={assessment.id} variants={itemVariants}>
                    <Card
                      className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full ${
                        !isCompleted ? 'opacity-75' : ''
                      }`}
                      onClick={() => handleAssessmentClick(assessment)}
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {assessment.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge className={difficultyColors[assessment.difficulty]}>
                              {assessment.difficulty === 'easy' ? '简单' :
                               assessment.difficulty === 'medium' ? '中等' : '困难'}
                            </Badge>
                            {!isCompleted && (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                <Lock className="w-3 h-3 mr-1" />
                                即将开放
                              </Badge>
                            )}
                          </div>
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
                          {isCompleted && (
                            <span className="text-green-500 font-medium">完整版</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {assessments.length === 0 && families.length === 0 && (
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