import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, History } from 'lucide-react';
import { Card } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import type { AssessmentResult } from '@/shared/types';

const MOCK_HISTORY: AssessmentResult[] = [
  {
    id: 1,
    assessmentId: 'mbti-basic',
    assessmentSlug: 'mbti-basic',
    assessmentName: 'MBTI 职业性格测试',
    category: 'personality',
    completedAt: new Date('2024-01-15'),
    answers: {},
    rawScores: {},
    dimensionScores: { EI: 6.5, SN: 7.8, TF: 5.2, JP: 6.8 },
    resultProfileId: 'INTJ',
    resultProfileName: '建筑师',
    totalScore: 72,
  },
  {
    id: 2,
    assessmentId: 'stress-check',
    assessmentSlug: 'stress-check',
    assessmentName: '压力指数评估',
    category: 'psychology',
    completedAt: new Date('2024-01-10'),
    answers: {},
    rawScores: {},
    dimensionScores: { stressLoad: 8.8, emotionalStrain: 8.2, recoveryCapacity: 8.0 },
    resultProfileId: 'mild-stress',
    resultProfileName: '轻度压力',
    totalScore: 85,
  },
];

const Profile: React.FC = () => {
  const { animationLevel, reducedMotion } = useSettingsStore();
  const { animationLevel: animLevel, setAnimationLevel, fontSize, setFontSize } = useSettingsStore();
  const [history, setHistory] = React.useState<AssessmentResult[]>([]);

  React.useEffect(() => {
    setHistory(MOCK_HISTORY);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reducedMotion || animationLevel === 'none' ? 0 : 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          个人中心
        </h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    探索者
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    开始你的测评之旅
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  测评历史
                </h3>
              </div>

              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.assessmentName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(result.completedAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-right">
                        {result.resultProfileName && (
                          <span className="text-sm font-medium text-primary-500">
                            {result.resultProfileName}
                          </span>
                        )}
                        {result.totalScore && (
                          <span className="ml-2 text-2xl font-bold text-primary-500">
                            {result.totalScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  暂无测评记录
                </p>
              )}

              {history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">平均得分</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(history.reduce((sum, h) => sum + (h.totalScore || 0), 0) / history.length)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  设置
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    动画级别
                  </label>
                  <div className="flex gap-2">
                    {(['none', 'low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setAnimationLevel(level)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          animLevel === level
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {level === 'none' ? '关闭' : level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    字体大小: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
