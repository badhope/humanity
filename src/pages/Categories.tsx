import { useEffect, useState, useRef } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Sparkles, Lock, Clock, AlertCircle } from 'lucide-react';
import { PageTransition } from '@/components/molecules';
import { Button, Card, Badge } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import { getModules, getModuleNavDestination, type ModuleInfo } from '@/features/assessment';
import {
  User,
  Brain,
  Lightbulb,
  Compass,
  Briefcase,
  ChevronRight,
  Zap,
  Layers,
} from 'lucide-react';

const iconMap: Record<string, FC<{ className?: string }>> = {
  User,
  Brain,
  Lightbulb,
  Compass,
  Briefcase,
};

const colorMap: Record<string, {
  bg: string;
  border: string;
  icon: string;
  badge: string;
  gradient: string;
  glow: string;
  accent: string;
  hover: string;
}> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50',
    gradient: 'from-blue-100/60 via-blue-50/40 to-indigo-100/40 dark:from-blue-900/20 dark:via-blue-800/10 dark:to-indigo-900/20',
    glow: 'shadow-blue-500/20',
    accent: 'from-blue-500 to-cyan-500',
    hover: 'group-hover:shadow-blue-500/25',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/20',
    border: 'border-purple-200/60 dark:border-purple-800/40',
    icon: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50',
    gradient: 'from-purple-100/60 via-purple-50/40 to-pink-100/40 dark:from-purple-900/20 dark:via-purple-800/10 dark:to-pink-900/20',
    glow: 'shadow-purple-500/20',
    accent: 'from-purple-500 to-pink-500',
    hover: 'group-hover:shadow-purple-500/25',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/20',
    border: 'border-yellow-200/60 dark:border-yellow-800/40',
    icon: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50',
    gradient: 'from-yellow-100/60 via-yellow-50/40 to-amber-100/40 dark:from-yellow-900/20 dark:via-yellow-800/10 dark:to-amber-900/20',
    glow: 'shadow-yellow-500/20',
    accent: 'from-yellow-500 to-orange-500',
    hover: 'group-hover:shadow-yellow-500/25',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20',
    border: 'border-green-200/60 dark:border-green-800/40',
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200/50 dark:border-green-700/50',
    gradient: 'from-green-100/60 via-green-50/40 to-emerald-100/40 dark:from-green-900/20 dark:via-green-800/10 dark:to-emerald-900/20',
    glow: 'shadow-green-500/20',
    accent: 'from-green-500 to-emerald-500',
    hover: 'group-hover:shadow-green-500/25',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-900/20',
    border: 'border-orange-200/60 dark:border-orange-800/40',
    icon: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200/50 dark:border-orange-700/50',
    gradient: 'from-orange-100/60 via-orange-50/40 to-red-100/40 dark:from-orange-900/20 dark:via-orange-800/10 dark:to-red-900/20',
    glow: 'shadow-orange-500/20',
    accent: 'from-orange-500 to-red-500',
    hover: 'group-hover:shadow-orange-500/25',
  },
};

const statusConfig: Record<string, {
  label: string;
  dotClass: string;
  pingClass: string;
  textClass: string;
}> = {
  active: {
    label: '可用',
    dotClass: 'bg-green-500',
    pingClass: 'bg-green-400',
    textClass: 'text-green-600 dark:text-green-400',
  },
  preparing: {
    label: '准备中',
    dotClass: 'bg-blue-500',
    pingClass: 'bg-blue-400',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  maintenance: {
    label: '维护中',
    dotClass: 'bg-amber-500',
    pingClass: 'bg-amber-400',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  disabled: {
    label: '已停用',
    dotClass: 'bg-gray-500',
    pingClass: 'bg-gray-400',
    textClass: 'text-gray-500 dark:text-gray-400',
  },
};

const Categories: FC = () => {
  const navigate = useNavigate();
  const { animationLevel, reducedMotion } = useSettingsStore();
  const shouldAnimate = animationLevel !== 'none' && !reducedMotion;
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 300], [0, 50]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.3]);

  useEffect(() => {
    async function loadModules() {
      try {
        const allModules = await getModules();
        const sortedModules = allModules.sort((a, b) => a.order - b.order);
        setModules(sortedModules);
      } catch (error) {
        console.error('Failed to load modules:', error);
      } finally {
        setLoading(false);
      }
    }
    loadModules();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldAnimate ? 0.1 : 0,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const iconFloatVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const handleModuleClick = (module: ModuleInfo) => {
    const destination = getModuleNavDestination(module);
    navigate(destination);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16">
              <div className="h-3 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 mb-6" />
              <div className="h-12 w-48 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
              <div className="h-5 w-80 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="relative h-72 animate-pulse rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
                  <div className="absolute inset-0 flex flex-col p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-gray-300/50 dark:bg-gray-700/50" />
                      <div className="h-6 w-20 rounded-full bg-gray-300/50 dark:bg-gray-700/50" />
                    </div>
                    <div className="h-6 w-32 rounded-lg bg-gray-300/50 dark:bg-gray-700/50 mb-3" />
                    <div className="h-4 w-full rounded bg-gray-200/50 dark:bg-gray-700/50 mb-2" />
                    <div className="h-4 w-3/4 rounded bg-gray-200/50 dark:bg-gray-700/50" />
                    <div className="mt-auto flex justify-between items-center pt-4">
                      <div className="h-4 w-20 rounded bg-gray-300/50 dark:bg-gray-700/50" />
                      <div className="h-8 w-8 rounded-lg bg-gray-300/50 dark:bg-gray-700/50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-12" ref={pageRef}>
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white/80 to-purple-50/30 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-purple-950/50" />
          <motion.div
            className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary-200/20 to-purple-200/10 blur-[100px] dark:from-primary-900/20 dark:to-purple-900/10"
            animate={shouldAnimate ? { opacity: [0.3, 0.5, 0.3], scale: [0.9, 1.1, 0.9] } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[5%] bottom-[30%] h-[350px] w-[350px] rounded-full bg-gradient-to-br from-purple-200/15 to-pink-200/10 blur-[80px] dark:from-purple-900/15 dark:to-pink-900/10"
            animate={shouldAnimate ? { opacity: [0.2, 0.4, 0.2], scale: [0.95, 1.05, 0.95] } : {}}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <motion.div
          className="mb-14"
          initial="hidden"
          animate="visible"
          variants={shouldAnimate ? headerVariants : {}}
          style={{ y: shouldAnimate ? headerY : 0, opacity: shouldAnimate ? headerOpacity : 1 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-8 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-300 hover:-translate-x-1"
          >
            返回首页
          </Button>

          <motion.div
            variants={shouldAnimate ? badgeVariants : {}}
            className="mb-5"
          >
            <div className="group relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary-200/50 bg-gradient-to-r from-primary-50/90 to-purple-50/90 px-5 py-2 text-sm font-medium text-primary-700 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.45)] hover:scale-[1.02] dark:border-primary-700/40 dark:from-primary-900/50 dark:to-purple-900/50 dark:text-primary-300">
              <motion.div
                animate={shouldAnimate ? { rotate: [0, 15, 0, -15, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
              >
                <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
              </motion.div>
              <span>全部模块</span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-5 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            测评分类
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-xl"
          >
            选择一个分类，开启你的自我探索之旅
            <motion.span
              className="ml-2 inline-flex items-center gap-1 text-primary-500"
              animate={shouldAnimate ? { opacity: [0.6, 1, 0.6] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-4 w-4" />
            </motion.span>
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {modules.map((module, index) => {
            const Icon = iconMap[module.icon] || User;
            const colors = colorMap[module.color] || colorMap.blue;
            const status = statusConfig[module.status] || statusConfig.active;
            const isActive = module.status === 'active';
            const isPreparing = module.status === 'preparing';
            const isMaintenance = module.status === 'maintenance';
            const isDisabled = module.status === 'disabled';

            return (
              <motion.div
                key={module.id}
                variants={cardVariants}
                className="group"
              >
                <Card
                  variant="hover"
                  className={`cursor-pointer h-full relative overflow-hidden transition-all duration-300 ${
                    !isActive ? 'opacity-75' : ''
                  }`}
                  onClick={() => handleModuleClick(module)}
                  isAnimated={shouldAnimate}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} transition-opacity duration-500 ${
                    isActive ? 'opacity-70 group-hover:opacity-90' : 'opacity-50'
                  }`} />

                  {!isActive && (
                    <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/15" />
                  )}

                  {isActive && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className={`absolute -inset-4 bg-gradient-to-r from-transparent via-${module.color}-500/5 to-transparent rotate-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000`} />
                    </div>
                  )}

                  <div className="relative p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        className="relative"
                        variants={shouldAnimate ? iconFloatVariants : {}}
                        initial="initial"
                        animate="animate"
                      >
                        <div className={`absolute -inset-3 rounded-2xl ${colors.glow} blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-400`} />
                        <div className={`relative p-4 rounded-2xl ${colors.bg} border-2 ${colors.border} shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 ${colors.hover}`}>
                          <Icon className={`w-7 h-7 ${colors.icon}`} />
                        </div>
                      </motion.div>

                      <div className="flex flex-col items-end gap-2">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          {!isActive && (
                            <Badge className={`${colors.badge} px-2.5 py-1 text-xs shadow-sm`}>
                              {isPreparing && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {status.label}
                                </span>
                              )}
                              {isMaintenance && (
                                <span className="flex items-center gap-1.5">
                                  <Lock className="h-3 w-3" />
                                  {status.label}
                                </span>
                              )}
                              {isDisabled && (
                                <span className="flex items-center gap-1.5">
                                  <AlertCircle className="h-3 w-3" />
                                  {status.label}
                                </span>
                              )}
                            </Badge>
                          )}
                        </motion.div>

                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-green-100/80 px-2.5 py-1 text-xs font-medium text-green-700 backdrop-blur-sm dark:bg-green-900/40 dark:text-green-300 border border-green-200/50 dark:border-green-800/50 shadow-sm"
                          >
                            <span className="relative flex h-2 w-2">
                              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${status.pingClass} opacity-75`} />
                              <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dotClass}`} />
                            </span>
                            {status.label}
                          </motion.span>
                        )}
                      </div>
                    </div>

                    <motion.h3
                      className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                      whileHover={shouldAnimate ? { x: 3 } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {module.name}
                    </motion.h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-5 flex-grow text-sm leading-relaxed">
                      {module.shortDescription}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 dark:border-gray-700/40">
                      <motion.span
                        className={`text-sm font-medium transition-all duration-300 ${
                          isActive ? 'text-primary-500 group-hover:text-primary-600' : 'text-gray-400'
                        }`}
                        whileHover={isActive && shouldAnimate ? { x: 2 } : {}}
                      >
                        {isActive ? '点击进入' : isPreparing ? '即将推出' : isMaintenance ? '维护中' : '已停用'}
                      </motion.span>
                      <motion.div
                        animate={isActive && shouldAnimate ? { x: [0, 5, 0] } : {}}
                        transition={isActive ? { duration: 1.5, repeat: Infinity, repeatDelay: 3 } : {}}
                        className="relative"
                      >
                        <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${
                          isActive ? 'text-primary-500' : 'text-gray-400'
                        }`} />
                      </motion.div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300/50 dark:group-hover:border-primary-700/30 transition-colors duration-500 pointer-events-none" />
                  )}

                  {isPreparing && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-blue-300/40 dark:border-blue-700/30 pointer-events-none" />
                  )}

                  {isMaintenance && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-300/40 dark:border-amber-700/30 pointer-events-none" />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm">
            <Layers className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              共 {modules.length} 个测评模块
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Categories;
