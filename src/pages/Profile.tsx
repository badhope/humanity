import { useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  History,
  FileText,
  Trash2,
  Download,
  Clock,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getAllResults,
  getResultsCount,
  getTotalDurationSpent,
  deleteResult,
  clearAllResults,
} from '@/features/storage/resultService';
import {
  getAllDrafts,
  deleteDraft,
  clearAllDrafts,
} from '@/features/storage/draftService';
import {
  exportAllData,
  downloadExportData,
  clearAllData,
} from '@/features/storage/dataManagement';
import { syncProfileFromResults } from '@/features/storage/profileService';
import type { ResultRecord, DraftRecord } from '@/shared/types';

type TabType = 'overview' | 'history' | 'drafts' | 'settings';

const Profile: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    animationLevel,
    reducedMotion,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    showTimer,
    setShowTimer,
    autoSaveDraft,
    setAutoSaveDraft,
    resetSettings,
  } = useSettingsStore();

  const shouldAnimate = animationLevel !== 'none' && !reducedMotion;

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'history', 'drafts', 'settings'].includes(tab)) {
      return tab as TabType;
    }
    return 'overview';
  });
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearTarget, setClearTarget] = useState<'results' | 'drafts' | 'all' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await syncProfileFromResults();
      const [resultsData, draftsData, count, duration] = await Promise.all([
        getAllResults(),
        getAllDrafts(),
        getResultsCount(),
        getTotalDurationSpent(),
      ]);
      setResults(resultsData);
      setDrafts(draftsData);
      setTotalAssessments(count);
      setTotalDuration(duration);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (id: number) => {
    try {
      await deleteResult(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete result:', error);
    }
  };

  const handleDeleteDraft = async (id: number) => {
    try {
      await deleteDraft(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  const handleClearResults = async () => {
    try {
      await clearAllResults();
      await loadData();
      setShowClearConfirm(false);
      setClearTarget(null);
    } catch (error) {
      console.error('Failed to clear results:', error);
    }
  };

  const handleClearDrafts = async () => {
    try {
      await clearAllDrafts();
      await loadData();
      setShowClearConfirm(false);
      setClearTarget(null);
    } catch (error) {
      console.error('Failed to clear drafts:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      await loadData();
      setShowClearConfirm(false);
      setClearTarget(null);
      resetSettings();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      downloadExportData(data);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleViewResult = (result: ResultRecord) => {
    if (result.id) {
      navigate(`/results/${result.assessmentSlug}?resultId=${result.id}`);
    } else {
      navigate(`/results/${result.assessmentSlug}`);
    }
  };

  const handleContinueDraft = (draft: DraftRecord) => {
    navigate(`/quiz/${draft.assessmentSlug}`);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}小时${remainingMinutes}分钟`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      personality: '人格类型',
      psychology: '心理特质',
      cognition: '认知能力',
      ideology: '价值观',
      career: '职业倾向',
    };
    return names[category] || category;
  };

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

  const tabs: { id: TabType; label: string; icon: ReactNode }[] = [
    { id: 'overview', label: '概览', icon: <User className="w-4 h-4" /> },
    { id: 'history', label: '历史', icon: <History className="w-4 h-4" /> },
    { id: 'drafts', label: '草稿箱', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: '设置', icon: <Settings className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-12 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white/90 to-purple-50/40 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-purple-950/50" />
        <motion.div
          className="absolute left-[5%] top-[20%] h-[350px] w-[350px] rounded-full bg-gradient-to-br from-primary-200/25 to-purple-200/15 blur-[100px] dark:from-primary-900/25 dark:to-purple-900/15"
          animate={shouldAnimate ? { opacity: [0.4, 0.6, 0.4], scale: [0.95, 1.05, 0.95] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[10%] bottom-[30%] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/10 blur-[80px] dark:from-purple-900/20 dark:to-pink-900/10"
          animate={shouldAnimate ? { opacity: [0.3, 0.5, 0.3], scale: [0.9, 1.1, 0.9] } : {}}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="mx-auto max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3"
        >
          <div className="relative">
            <div className="absolute -inset-2 rounded-xl bg-primary-500/20 blur-md opacity-0" />
            <User className="relative w-8 h-8 text-primary-500" />
          </div>
          个人中心
        </motion.h1>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md border border-gray-200/50 dark:border-gray-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {activeTab === 'overview' && (
            <>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    测评统计
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-3xl font-bold text-primary-500">{totalAssessments}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">已完成测评</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-3xl font-bold text-primary-500">{formatDuration(totalDuration)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">累计时长</div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      最近测评
                    </h3>
                    {results.length > 0 && (
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-sm text-primary-500 hover:text-primary-600"
                      >
                        查看全部
                      </button>
                    )}
                  </div>
                  {results.length > 0 ? (
                    <div className="space-y-3">
                      {results.slice(0, 3).map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {result.assessmentName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(result.completedAt)}
                            </p>
                          </div>
                          <Badge variant="primary">{result.resultType}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">暂无测评记录</p>
                    </div>
                  )}
                </Card>
              </motion.div>

              {drafts.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        草稿箱 ({drafts.length})
                      </h3>
                      <button
                        onClick={() => setActiveTab('drafts')}
                        className="text-sm text-primary-500 hover:text-primary-600"
                      >
                        查看全部
                      </button>
                    </div>
                    <div className="space-y-3">
                      {drafts.slice(0, 2).map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {draft.assessmentName}
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                              进度: {Math.round((draft.currentQuestionIndex / draft.totalQuestions) * 100)}%
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleContinueDraft(draft)}
                          >
                            继续
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        测评历史
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        共 {results.length} 条记录
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportData}
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        导出
                      </Button>
                      {results.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setClearTarget('results');
                            setShowClearConfirm(true);
                          }}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                          清空
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result) => (
                    <motion.div key={result.id} variants={itemVariants}>
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {result.assessmentName}
                              </h4>
                              <Badge variant="primary">{result.resultType}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {getCategoryName(result.category)} • {formatDate(result.completedAt)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {result.summary}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(result.durationSpent)}
                              </span>
                              <span>{result.answerCount} 道题</span>
                              {result.id && <span className="text-gray-300">#{result.id}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleViewResult(result)}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                          >
                            查看结果
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => result.id && handleDeleteResult(result.id)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                          >
                            删除
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div variants={itemVariants}>
                  <Card className="p-8 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      暂无测评历史
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      完成测评后，您的记录会显示在这里
                    </p>
                    <Button onClick={() => navigate('/categories')}>
                      开始测评
                    </Button>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {activeTab === 'drafts' && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        草稿箱
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {drafts.length} 个未完成的测评
                      </p>
                    </div>
                    {drafts.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setClearTarget('drafts');
                          setShowClearConfirm(true);
                        }}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        清空
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>

              {drafts.length > 0 ? (
                <div className="space-y-3">
                  {drafts.map((draft) => (
                    <motion.div key={draft.id} variants={itemVariants}>
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {draft.assessmentName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {getCategoryName(draft.category)} • 最后更新: {formatDate(draft.updatedAt)}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{
                                    width: `${(draft.currentQuestionIndex / draft.totalQuestions) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {Math.round((draft.currentQuestionIndex / draft.totalQuestions) * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              第 {draft.currentQuestionIndex + 1} / {draft.totalQuestions} 题
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="primary"
                            className="flex-1"
                            onClick={() => handleContinueDraft(draft)}
                          >
                            继续作答
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => draft.id && handleDeleteDraft(draft.id)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                          >
                            删除
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div variants={itemVariants}>
                  <Card className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      草稿箱是空的
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      开始测评后，您的进度会自动保存
                    </p>
                    <Button onClick={() => navigate('/categories')}>
                      开始测评
                    </Button>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    外观设置
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        主题
                      </label>
                      <div className="flex gap-2">
                        {([
                          { value: 'light', label: '浅色', icon: <Sun className="w-4 h-4" /> },
                          { value: 'dark', label: '深色', icon: <Moon className="w-4 h-4" /> },
                          { value: 'system', label: '跟随系统', icon: <Monitor className="w-4 h-4" /> },
                        ] as const).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setTheme(opt.value)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                              theme === opt.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            {opt.icon}
                            <span className="text-sm">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        字号大小: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    答题设置
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">自动保存草稿</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">退出后自动保存答题进度</p>
                      </div>
                      <button
                        onClick={() => setAutoSaveDraft(!autoSaveDraft)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          autoSaveDraft ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            autoSaveDraft ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">显示计时器</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">在答题页面显示已用时间</p>
                      </div>
                      <button
                        onClick={() => setShowTimer(!showTimer)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          showTimer ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            showTimer ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    动画设置
                  </h3>
                  <div className="space-y-3">
                    {([
                      { value: 'none', label: '无动画' },
                      { value: 'low', label: '低' },
                      { value: 'medium', label: '中' },
                      { value: 'high', label: '高' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => useSettingsStore.getState().setAnimationLevel(opt.value)}
                        className={`w-full px-4 py-2 rounded-lg border-2 transition-colors text-left ${
                          animationLevel === opt.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    数据管理
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleExportData}
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      导出所有数据
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-amber-600 dark:text-amber-400"
                      onClick={() => {
                        setClearTarget('all');
                        setShowClearConfirm(true);
                      }}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      清空所有本地数据
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>

        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  确认操作
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {clearTarget === 'results' && '确定要清空所有测评历史记录吗？此操作不可恢复。'}
                {clearTarget === 'drafts' && '确定要清空所有草稿吗？此操作不可恢复。'}
                {clearTarget === 'all' && '确定要清空所有本地数据吗？包括设置、历史记录和草稿。此操作不可恢复。'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowClearConfirm(false);
                    setClearTarget(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  onClick={() => {
                    if (clearTarget === 'results') handleClearResults();
                    else if (clearTarget === 'drafts') handleClearDrafts();
                    else if (clearTarget === 'all') handleClearAll();
                  }}
                >
                  确认清空
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
