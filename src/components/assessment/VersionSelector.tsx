import { FC } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Star, CheckCircle, AlertCircle, Sparkles, Zap, Shield } from 'lucide-react';
import { Button, Card } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import type { AssessmentFamily, VersionInfo } from '@/shared/types';

interface VersionSelectorProps {
  family: AssessmentFamily;
  onSelectVersion: (version: VersionInfo, slug: string) => void;
  onBack: () => void;
}

const levelConfig: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: FC<{ className?: string }>;
  badge: string;
}> = {
  lite: {
    label: '简单版',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20',
    border: 'border-green-200/60 dark:border-green-800/40',
    icon: Zap,
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200/50 dark:border-green-800/50',
  },
  standard: {
    label: '标准版',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    icon: Star,
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50',
  },
  expert: {
    label: '专家版',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/20',
    border: 'border-purple-200/60 dark:border-purple-800/40',
    icon: Shield,
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50',
  },
};

const levelDescriptions: Record<string, { short: string; features: string[]; highlight: string }> = {
  lite: {
    short: '快速体验',
    highlight: '适合首次体验，想快速了解大概情况',
    features: ['题目最少', '耗时最短', '结果直观'],
  },
  standard: {
    short: '推荐版本',
    highlight: '大多数用户的首选，推荐作为首次测评的选择',
    features: ['题量适中', '维度均衡', '结果可靠'],
  },
  expert: {
    short: '深度分析',
    highlight: '想获得更精细分析结果的用户首选',
    features: ['题目最全', '边界题+校验', '结果最精细'],
  },
};

export const VersionSelector: FC<VersionSelectorProps> = ({
  family,
  onSelectVersion,
  onBack,
}) => {
  const { animationLevel, reducedMotion } = useSettingsStore();
  const shouldAnimate = animationLevel !== 'none' && !reducedMotion;

  const getSlug = (level: string): string => {
    return `${family.familyId}-${level}`;
  };

  const sortedVersions = [...family.versions].sort((a, b) => {
    const order = { lite: 0, standard: 1, expert: 2 };
    return order[a.level] - order[b.level];
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: shouldAnimate ? 0.12 : 0 },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={shouldAnimate ? containerVariants : {}}
        >
          <motion.div variants={shouldAnimate ? headerVariants : {}}>
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 transition-all hover:-translate-x-1 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              返回
            </button>
          </motion.div>

          <motion.div
            variants={shouldAnimate ? headerVariants : {}}
            className="mb-10 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200/40 bg-gradient-to-r from-primary-50/80 to-purple-50/80 px-4 py-1.5 text-xs font-medium text-primary-700 shadow-sm dark:border-primary-700/30 dark:from-primary-900/40 dark:to-purple-900/40 dark:text-primary-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>选择版本</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {family.familyName}
            </h1>
            <p className="mx-auto max-w-lg text-lg text-gray-600 dark:text-gray-300">
              {family.description}
            </p>
          </motion.div>

          <div className="space-y-5">
            {sortedVersions.map((version) => {
              const config = levelConfig[version.level];
              const desc = levelDescriptions[version.level];
              const slug = getSlug(version.level);
              const LevelIcon = config.icon;
              const isActive = version.status === 'active';
              const isRecommended = version.recommended;

              return (
                <motion.div
                  key={version.level}
                  variants={shouldAnimate ? cardVariants : {}}
                  className="group relative"
                >
                  <Card
                    className={`relative overflow-hidden transition-all duration-400 ${
                      isRecommended
                        ? 'border-2 shadow-xl shadow-primary-500/10'
                        : 'border shadow-lg'
                    } ${
                      isRecommended
                        ? 'border-primary-400/60 dark:border-primary-600/40'
                        : config.border
                    } ${
                      isActive ? 'cursor-pointer hover:shadow-xl' : 'opacity-80'
                    }`}
                    onClick={() => isActive && onSelectVersion(version, slug)}
                    isAnimated={shouldAnimate}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-60 transition-opacity duration-300 ${
                      isActive ? 'group-hover:opacity-80' : 'opacity-50'
                    }`} />

                    {isRecommended && (
                      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-primary-500/20" />
                    )}

                    {!isActive && (
                      <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/10" />
                    )}

                    <div className="relative p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <motion.div
                            className="relative"
                            whileHover={isActive ? { scale: 1.05 } : {}}
                            transition={{ duration: 0.2 }}
                          >
                            {isRecommended && (
                              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-primary-400/30 to-purple-400/30 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                            )}
                            <div className={`relative p-4 rounded-2xl ${config.bg} border-2 ${config.border} shadow-inner transition-all duration-300 ${
                              isActive ? 'group-hover:shadow-lg' : ''
                            }`}>
                              <LevelIcon className={`h-8 w-8 ${config.color}`} />
                            </div>
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {version.name}
                              </h3>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}>
                                {config.label}
                              </span>
                              {isRecommended && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                                  <Star className="h-3 w-3" />
                                  推荐
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {version.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 backdrop-blur-sm dark:bg-gray-800/60">
                                <Clock className="h-3.5 w-3.5" />
                                约 {version.estimatedMinutes} 分钟
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 backdrop-blur-sm dark:bg-gray-800/60">
                                <FileText className="h-3.5 w-3.5" />
                                {version.questionCount} 题
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {desc.features.map((feature) => (
                                <span
                                  key={feature}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm transition-colors duration-200 hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {isActive ? (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                size="sm"
                                variant={isRecommended ? 'primary' : 'secondary'}
                                className={`shadow-md transition-all duration-300 ${
                                  isRecommended
                                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-primary-500/25'
                                    : ''
                                }`}
                                onClick={() => {
                                  onSelectVersion(version, slug);
                                }}
                              >
                                <span className="relative flex items-center gap-1.5">
                                  {isRecommended ? (
                                    <Star className="h-3.5 w-3.5" />
                                  ) : null}
                                  开始测试
                                </span>
                              </Button>
                            </motion.div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
                              <AlertCircle className="h-3.5 w-3.5" />
                              即将上线
                            </span>
                          )}

                          {isRecommended && (
                            <p className="text-xs text-center text-primary-600 dark:text-primary-400 max-w-[120px]">
                              {desc.highlight}
                            </p>
                          )}
                        </div>
                      </div>

                      {!isActive && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                      )}
                    </div>

                    {isActive && !isRecommended && (
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary-300/40 dark:group-hover:border-primary-700/30 transition-colors duration-300 pointer-events-none" />
                    )}

                    {isRecommended && (
                      <div className="absolute inset-0 rounded-xl border-2 border-primary-400/40 dark:border-primary-600/30 pointer-events-none" />
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            variants={shouldAnimate ? cardVariants : {}}
            className="mt-8 rounded-2xl border border-gray-200/60 bg-gradient-to-br from-gray-50 to-slate-100 p-6 dark:border-gray-700/50 dark:from-gray-800/50 dark:to-slate-800/50"
          >
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-primary-500" />
              如何选择？
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-lg bg-green-100 p-1.5 dark:bg-green-900/40">
                  <Zap className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">简单版</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">适合想快速了解大概情况</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/40">
                  <Star className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">标准版</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">推荐作为首次测评的选择</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 rounded-lg bg-purple-100 p-1.5 dark:bg-purple-900/40">
                  <Shield className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">专家版</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">想获得更精细分析结果</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
