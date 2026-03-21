import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Brain, Compass, Heart, ChevronDown, Atom } from 'lucide-react';
import { Button } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';

const Home: FC = () => {
  const { animationLevel, reducedMotion } = useSettingsStore();
  const shouldAnimate = animationLevel !== 'none' && !reducedMotion;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsLoaded(true);
    }
  }, [shouldAnimate]);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.96]);
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);

  const smoothOpacity = useSpring(heroOpacity, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(heroScale, { stiffness: 100, damping: 30 });

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -45 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay: 0.4 + i * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const floatingVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
      rotate: [0, 12, 0],
      transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const glowPulseVariants = {
    initial: { opacity: 0.3, scale: 0.85 },
    animate: {
      opacity: [0.3, 0.65, 0.3],
      scale: [0.85, 1.1, 0.85],
      transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const orbVariants = {
    initial: { x: 0, y: 0 },
    animate: {
      x: [0, 40, 0],
      y: [0, -30, 0],
      transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 1.4 + i * 0.1,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldAnimate ? 0.1 : 0,
      },
    },
  };

  const scrollIndicatorVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 2.2, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const titleLetters = ['H', 'u', 'm', 'a', 'n'];
  const osLetters = ['O', 'S'];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white/95 to-purple-50/60 dark:from-gray-900/95 dark:via-gray-900 dark:to-purple-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_var(--tw-gradient-stops))] from-primary-200/40 via-primary-100/20 to-transparent dark:from-primary-900/40 dark:via-primary-800/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent dark:from-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_var(--tw-gradient-stops))] from-pink-200/15 via-transparent to-transparent dark:from-pink-900/15" />

        {shouldAnimate && isLoaded && (
          <>
            <motion.div
              className="absolute left-[5%] top-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-300/30 to-purple-300/20 blur-[120px] dark:from-primary-700/30 dark:to-purple-700/20"
              variants={glowPulseVariants}
              initial="initial"
              animate="animate"
            />
            <motion.div
              className="absolute right-[5%] top-[15%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-300/25 to-pink-300/15 blur-[100px] dark:from-purple-700/20 dark:to-pink-700/15"
              variants={glowPulseVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '2s' }}
            />
            <motion.div
              className="absolute bottom-[5%] left-[10%] h-[450px] w-[450px] rounded-full bg-gradient-to-br from-blue-300/20 to-cyan-300/10 blur-[100px] dark:from-blue-700/15 dark:to-cyan-700/10"
              variants={glowPulseVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '4s' }}
            />

            <motion.div
              className="absolute left-[8%] top-[25%]"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary-400/30 blur-xl" />
                <Brain className="relative h-12 w-12 text-primary-500/60 drop-shadow-lg" />
              </div>
            </motion.div>
            <motion.div
              className="absolute right-[12%] top-[18%]"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '1s' }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-pink-400/30 blur-xl" />
                <Heart className="relative h-10 w-10 text-pink-500/60 drop-shadow-lg" />
              </div>
            </motion.div>
            <motion.div
              className="absolute left-[18%] bottom-[30%]"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '2s' }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-xl" />
                <Compass className="relative h-11 w-11 text-blue-500/60 drop-shadow-lg" />
              </div>
            </motion.div>
            <motion.div
              className="absolute right-[18%] bottom-[25%]"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '3s' }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl" />
                <Zap className="relative h-10 w-10 text-amber-500/60 drop-shadow-lg" />
              </div>
            </motion.div>
            <motion.div
              className="absolute left-[40%] top-[12%]"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-400/30 blur-xl" />
                <Sparkles className="relative h-8 w-8 text-purple-500/60 drop-shadow-lg" />
              </div>
            </motion.div>
            <motion.div
              className="absolute right-[30%] bottom-[40%]"
              variants={orbVariants}
              initial="initial"
              animate="animate"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/60 to-purple-400/60 blur-sm" />
                <div className="relative h-4 w-4 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 shadow-lg shadow-primary-500/50" />
              </div>
            </motion.div>
            <motion.div
              className="absolute left-[22%] top-[42%]"
              variants={orbVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '4s' }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/60 to-cyan-400/60 blur-sm" />
                <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50" />
              </div>
            </motion.div>
            <motion.div
              className="absolute right-[25%] top-[35%]"
              variants={orbVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '6s' }}
            >
              <Atom className="relative h-6 w-6 text-emerald-500/50 drop-shadow-lg" />
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center"
        style={{ opacity: smoothOpacity, scale: smoothScale, y: heroY }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={shouldAnimate ? badgeVariants : {}}
          className="mb-10"
        >
          <div className="group relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary-200/60 bg-gradient-to-r from-primary-50/90 to-purple-50/90 px-6 py-2.5 text-sm font-medium text-primary-700 shadow-[0_0_25px_-5px_rgba(99,102,241,0.35)] transition-all duration-300 hover:shadow-[0_0_35px_-5px_rgba(99,102,241,0.5)] hover:scale-[1.03] dark:border-primary-700/40 dark:from-primary-900/50 dark:to-purple-900/50 dark:text-primary-300 dark:shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)]">
            <motion.div
              animate={{ rotate: [0, 15, 0, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            >
              <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            </motion.div>
            <span className="relative">
              <span className="absolute -inset-1 rounded-full bg-primary-400/25 blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative">探索人性的多维入口</span>
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="mb-8 flex flex-col items-center justify-center font-display text-5xl font-bold tracking-tight text-gray-900 dark:text-white xs:text-6xl sm:text-7xl md:text-8xl"
          initial="hidden"
          animate="visible"
          style={{ perspective: '1000px' }}
        >
          <motion.div className="flex flex-wrap justify-center">
            {titleLetters.map((letter, i) => (
              <motion.span
                key={`human-${i}`}
                custom={i}
                variants={shouldAnimate ? letterVariants : {}}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-sm dark:from-white dark:via-gray-100 dark:to-white"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
          <motion.div
            className="my-3 flex items-center justify-center sm:my-0 sm:mx-4"
            variants={shouldAnimate ? badgeVariants : {}}
            initial="hidden"
            animate="visible"
          >
            <div className="relative h-1 w-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 shadow-lg shadow-primary-500/40 sm:w-14 md:w-20">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-400/50 to-purple-400/50 blur-md opacity-60" />
            </div>
          </motion.div>
          <motion.div className="flex flex-wrap justify-center">
            {osLetters.map((letter, i) => (
              <motion.span
                key={`os-${i}`}
                custom={i + 5}
                variants={shouldAnimate ? letterVariants : {}}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </motion.h1>

        <motion.p
          className="mb-12 px-4 text-center text-base leading-relaxed text-gray-600 dark:text-gray-300 xs:text-lg sm:text-xl md:text-2xl"
          initial="hidden"
          animate="visible"
          variants={shouldAnimate ? subtitleVariants : {}}
        >
          <span className="inline-block">聚合心理测评、人格测试、认知能力、价值观与职业倾向的</span>
          <span className="mt-1 inline-block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text font-semibold text-transparent dark:from-primary-400 dark:to-purple-400">全方位</span>
          <span className="inline-block">人类测评平台</span>
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-5 sm:flex-row"
          initial="hidden"
          animate="visible"
          variants={shouldAnimate ? ctaVariants : {}}
        >
          <Link to="/categories" className="group relative">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative"
            >
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70" />
              <div className="relative">
                <Button
                  size="lg"
                  variant="primary-glow"
                  rightIcon={
                    <motion.span
                      animate={{ x: [0, 5, 0], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  }
                  className="relative shadow-xl shadow-primary-500/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary-500/40"
                >
                  <span className="relative">
                    <span className="absolute -inset-3 rounded-xl bg-primary-400/25 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative font-medium">开始探索</span>
                  </span>
                </Button>
              </div>
            </motion.div>
          </Link>
          <Link to="/profile">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                size="lg"
                variant="ghost"
                className="group relative px-8 transition-all duration-300 hover:bg-gray-100/70 hover:shadow-lg dark:hover:bg-gray-800/70"
              >
                <span className="relative flex items-center gap-2">
                  <span className="absolute -inset-2 rounded-xl bg-purple-400/15 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="relative"
                  >
                    查看历史
                  </motion.span>
                </span>
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="relative z-10 mt-20 grid grid-cols-2 gap-6 sm:gap-8 xs:grid-cols-3 sm:grid-cols-5"
        initial="hidden"
        animate="visible"
        variants={shouldAnimate ? containerVariants : {}}
      >
        {[
          { label: '人格类型', value: '12+', icon: Brain, color: 'from-blue-500/30 to-cyan-500/20', glow: 'shadow-blue-500/30', iconColor: 'text-blue-600 dark:text-blue-400' },
          { label: '心理特质', value: '8+', icon: Heart, color: 'from-pink-500/30 to-rose-500/20', glow: 'shadow-pink-500/30', iconColor: 'text-pink-600 dark:text-pink-400' },
          { label: '认知能力', value: '15+', icon: Zap, color: 'from-amber-500/30 to-orange-500/20', glow: 'shadow-amber-500/30', iconColor: 'text-amber-600 dark:text-amber-400' },
          { label: '职业倾向', value: '6+', icon: Compass, color: 'from-emerald-500/30 to-green-500/20', glow: 'shadow-emerald-500/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          { label: '价值观念', value: '10+', icon: Sparkles, color: 'from-purple-500/30 to-violet-500/20', glow: 'shadow-purple-500/30', iconColor: 'text-purple-600 dark:text-purple-400' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={shouldAnimate ? statCardVariants : {}}
            className="text-center"
          >
            <motion.div
              whileHover={{ y: reducedMotion ? 0 : -6, scale: reducedMotion ? 1 : 1.08 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-xl ${stat.glow} backdrop-blur-sm transition-all duration-300 group-hover:shadow-2xl dark:from-gray-800/90 dark:to-gray-900/90 xs:h-16 xs:w-16 sm:h-16 sm:w-16`}
            >
              <stat.icon className={`h-6 w-6 ${stat.iconColor} transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7`} />
            </motion.div>
            <motion.div
              className="text-2xl font-bold tracking-tight text-gray-900 drop-shadow-sm dark:text-white xs:text-3xl sm:text-3xl md:text-4xl"
            >
              {stat.value}
            </motion.div>
            <div className="mt-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 xs:text-sm sm:text-sm">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        variants={shouldAnimate ? scrollIndicatorVariants : {}}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-3 cursor-pointer group"
        >
          <span className="text-xs font-medium tracking-widest text-gray-400 uppercase opacity-70 group-hover:opacity-100 transition-opacity duration-300">向下探索</span>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary-400/40 to-purple-400/40 blur-xl opacity-60" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300/60 bg-white/80 backdrop-blur-md shadow-lg shadow-primary-500/20 transition-all duration-300 group-hover:border-primary-400/70 group-hover:shadow-xl group-hover:shadow-primary-500/30 dark:border-gray-600/60 dark:bg-gray-900/80">
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300 group-hover:text-primary-500" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
