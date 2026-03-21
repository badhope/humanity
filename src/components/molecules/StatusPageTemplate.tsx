import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/molecules';
import { Button, Card } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import { ArrowLeft, Search } from 'lucide-react';

export interface StatusPageTemplateProps {
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
  details?: {
    title?: string;
    items?: string[];
  };
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  alternativeModules?: {
    name: string;
    description: string;
    status: string;
  }[];
  showBackButton?: boolean;
  backTarget?: string;
  statusType?: 'maintenance' | 'preparing' | 'empty' | 'error' | 'unavailable';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const iconGlowVariants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

const statusConfig = {
  maintenance: {
    iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    glowColor: 'shadow-amber-500/20',
    accentColor: 'border-amber-200 dark:border-amber-800/50',
    titleColor: 'text-gray-900 dark:text-white',
    descColor: 'text-gray-600 dark:text-gray-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  preparing: {
    iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    glowColor: 'shadow-blue-500/20',
    accentColor: 'border-blue-200 dark:border-blue-800/50',
    titleColor: 'text-gray-900 dark:text-white',
    descColor: 'text-gray-600 dark:text-gray-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  empty: {
    iconBg: 'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800',
    iconColor: 'text-gray-500 dark:text-gray-400',
    glowColor: 'shadow-gray-500/10',
    accentColor: 'border-gray-200 dark:border-gray-700',
    titleColor: 'text-gray-900 dark:text-white',
    descColor: 'text-gray-500 dark:text-gray-400',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  error: {
    iconBg: 'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    glowColor: 'shadow-red-500/20',
    accentColor: 'border-red-200 dark:border-red-800/50',
    titleColor: 'text-gray-900 dark:text-white',
    descColor: 'text-gray-600 dark:text-gray-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  unavailable: {
    iconBg: 'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800',
    iconColor: 'text-gray-400 dark:text-gray-500',
    glowColor: 'shadow-gray-500/10',
    accentColor: 'border-gray-200 dark:border-gray-700',
    titleColor: 'text-gray-700 dark:text-gray-300',
    descColor: 'text-gray-500 dark:text-gray-400',
    badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  },
};

export const StatusPageTemplate: FC<StatusPageTemplateProps> = ({
  icon,
  title,
  description,
  details,
  primaryAction,
  secondaryAction,
  alternativeModules,
  showBackButton = true,
  backTarget = '/categories',
  statusType = 'preparing',
}) => {
  const navigate = useNavigate();
  const { animationLevel, reducedMotion } = useSettingsStore();
  const isAnimationsEnabled = animationLevel !== 'none' && !reducedMotion;

  const config = statusConfig[statusType];

  return (
    <PageTransition>
      <div className="relative min-h-screen px-4 py-12">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className={`absolute inset-0 ${
            statusType === 'maintenance'
              ? 'bg-gradient-to-br from-amber-50/60 via-white/90 to-orange-50/40 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-amber-950/50'
              : statusType === 'preparing'
              ? 'bg-gradient-to-br from-blue-50/60 via-white/90 to-indigo-50/40 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-blue-950/50'
              : statusType === 'error'
              ? 'bg-gradient-to-br from-red-50/60 via-white/90 to-pink-50/40 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-red-950/50'
              : 'bg-gradient-to-br from-gray-50/60 via-white/90 to-slate-50/40 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-950/50'
          }`} />
          <motion.div
            className={`absolute left-[10%] top-[25%] h-[400px] w-[400px] rounded-full blur-[120px] ${
              statusType === 'maintenance'
                ? 'bg-gradient-to-br from-amber-200/30 to-orange-200/20 dark:from-amber-700/30 dark:to-orange-700/20'
                : statusType === 'preparing'
                ? 'bg-gradient-to-br from-blue-200/30 to-indigo-200/20 dark:from-blue-700/30 dark:to-indigo-700/20'
                : statusType === 'error'
                ? 'bg-gradient-to-br from-red-200/30 to-pink-200/20 dark:from-red-700/30 dark:to-pink-700/20'
                : 'bg-gradient-to-br from-gray-200/20 to-slate-200/15 dark:from-gray-700/20 dark:to-slate-700/15'
            }`}
            animate={isAnimationsEnabled ? { opacity: [0.3, 0.5, 0.3], scale: [0.9, 1.1, 0.9] } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute right-[10%] bottom-[30%] h-[350px] w-[350px] rounded-full blur-[100px] ${
              statusType === 'maintenance'
                ? 'bg-gradient-to-br from-orange-200/25 to-yellow-200/15 dark:from-orange-700/25 dark:to-yellow-700/15'
                : statusType === 'preparing'
                ? 'bg-gradient-to-br from-indigo-200/25 to-purple-200/15 dark:from-indigo-700/25 dark:to-purple-700/15'
                : statusType === 'error'
                ? 'bg-gradient-to-br from-pink-200/25 to-red-200/15 dark:from-pink-700/25 dark:to-red-700/15'
                : 'bg-gradient-to-br from-slate-200/20 to-gray-200/15 dark:from-slate-700/20 dark:to-gray-700/15'
            }`}
            animate={isAnimationsEnabled ? { opacity: [0.25, 0.45, 0.25], scale: [0.95, 1.05, 0.95] } : {}}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <div className="mx-auto max-w-xl">
          {showBackButton && (
            <Button
              variant="ghost"
              onClick={() => navigate(backTarget)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="mb-8"
            >
              返回
            </Button>
          )}

          <motion.div
            variants={isAnimationsEnabled ? containerVariants : {}}
            initial={isAnimationsEnabled ? 'hidden' : false}
            animate="visible"
            className="text-center"
          >
            <motion.div
              variants={isAnimationsEnabled ? itemVariants : {}}
              className="mb-8"
            >
              <motion.div
                className={`relative inline-flex ${config.iconBg} rounded-full p-1 shadow-lg ${config.glowColor}`}
                variants={isAnimationsEnabled ? iconGlowVariants : {}}
                initial="initial"
                animate={isAnimationsEnabled ? 'animate' : 'initial'}
              >
                <div className={`flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg}`}>
                  <div className={config.iconColor}>
                    {icon}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={isAnimationsEnabled ? itemVariants : {}}
              className="mb-2"
            >
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${config.badge} mb-4`}>
                {statusType === 'maintenance' && '⚙️ 维护中'}
                {statusType === 'preparing' && '🔄 准备中'}
                {statusType === 'empty' && '📭 暂无内容'}
                {statusType === 'error' && '❌ 出错了'}
                {statusType === 'unavailable' && '🚫 不可用'}
              </span>
            </motion.div>

            <motion.h1
              variants={isAnimationsEnabled ? itemVariants : {}}
              className={`mb-4 text-3xl font-bold ${config.titleColor}`}
            >
              {title}
            </motion.h1>

            <motion.p
              variants={isAnimationsEnabled ? itemVariants : {}}
              className={`mb-8 text-lg leading-relaxed ${config.descColor}`}
            >
              {description}
            </motion.p>

            {details && (
              <motion.div variants={isAnimationsEnabled ? itemVariants : {}}>
                <Card
                  variant="outlined"
                  className={`p-6 mb-6 text-left border ${config.accentColor}`}
                >
                  {details.title && (
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className={`font-semibold ${config.titleColor}`}>
                        {details.title}
                      </h2>
                    </div>
                  )}
                  {details.items && details.items.length > 0 && (
                    <ul className="text-left space-y-2.5">
                      {details.items.map((item, index) => (
                        <li key={index} className={`flex items-start gap-2 ${config.descColor}`}>
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${config.iconColor.replace('text-', 'bg-')}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </motion.div>
            )}

            {alternativeModules && alternativeModules.length > 0 && (
              <motion.div variants={isAnimationsEnabled ? itemVariants : {}}>
                <Card
                  variant="outlined"
                  className={`p-6 mb-6 text-left border ${config.accentColor}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className={`font-semibold ${config.titleColor}`}>
                      可用模块
                    </h2>
                  </div>
                  <ul className="space-y-2.5">
                    {alternativeModules.map((module, index) => (
                      <li key={index} className={config.descColor}>
                        <strong className={config.titleColor}>{module.name}</strong>
                        <span className="mx-2">—</span>
                        {module.description}
                        <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                          {module.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            )}

            <motion.div
              variants={isAnimationsEnabled ? itemVariants : {}}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {primaryAction && (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  <div className={`absolute -inset-1.5 rounded-xl opacity-0 blur-xl transition-opacity duration-300 ${
                    statusType === 'maintenance'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : statusType === 'preparing'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      : statusType === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500'
                      : 'bg-gradient-to-r from-primary-500 to-purple-500'
                  }`} />
                  <Button
                    onClick={primaryAction.onClick}
                    size="lg"
                    className="relative shadow-lg"
                  >
                    {primaryAction.label}
                  </Button>
                </motion.div>
              )}
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  size="lg"
                  className="border-2"
                >
                  {secondaryAction.label}
                </Button>
              )}
              {!primaryAction && !secondaryAction && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/categories')}
                  size="lg"
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  浏览所有测评
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};
