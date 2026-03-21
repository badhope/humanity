import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, X, List, AlertTriangle, Save, FileText, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/molecules';
import { Button, Card } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { fetchAssessmentBySlug } from '@/features/assessment/registry';
import { saveDraft, getDraftByAssessmentSlug, deleteDraftByAssessmentSlug } from '@/features/storage/draftService';
import type { AssessmentDefinition, DraftRecord } from '@/shared/types';

const Quiz: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { animationLevel, reducedMotion, autoSaveDraft, showTimer: showTimerSetting } = useSettingsStore();
  const shouldAnimate = animationLevel !== 'none' && !reducedMotion;
  const {
    currentQuestionIndex,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    setCurrentAssessment,
    setCurrentQuestionIndex,
    completeQuiz,
    resetQuiz,
    startTime,
    setStartTime,
  } = useQuizStore();

  const [assessment, setAssessment] = useState<AssessmentDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnswerSheetOpen, setIsAnswerSheetOpen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [draftRecord, setDraftRecord] = useState<DraftRecord | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    async function loadAssessment() {
      if (!assessmentId) {
        setError('测评 ID 不存在');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAssessmentBySlug(assessmentId);
        if (!data) {
          setError('未找到该测评');
          setLoading(false);
          return;
        }
        setAssessment(data);

        const existingDraft = await getDraftByAssessmentSlug(assessmentId);
        if (existingDraft) {
          const questionIds = new Set(data.questions.map(q => q.id));
          const validAnswers: Record<string, number> = {};
          let hasInvalidAnswers = false;

          for (const [qId, answer] of Object.entries(existingDraft.answers)) {
            if (questionIds.has(qId)) {
              validAnswers[qId] = answer;
            } else {
              hasInvalidAnswers = true;
            }
          }

          if (hasInvalidAnswers) {
            await deleteDraftByAssessmentSlug(assessmentId);
            existingDraft.answers = validAnswers;
            if (Object.keys(validAnswers).length === 0) {
              setDraftRecord(null);
            } else {
              existingDraft.currentQuestionIndex = Math.min(
                existingDraft.currentQuestionIndex,
                data.questions.length - 1
              );
              setDraftRecord({ ...existingDraft, answers: validAnswers });
            }
          } else {
            const validQuestionIndex = Math.min(
              existingDraft.currentQuestionIndex,
              data.questions.length - 1
            );
            setDraftRecord({ ...existingDraft, currentQuestionIndex: validQuestionIndex });
          }
        }

        if (!startTime) {
          setStartTime(new Date());
        }
        setCurrentAssessment(assessmentId);
      } catch (err) {
        console.error('Failed to load assessment:', err);
        setError('加载测评失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [assessmentId, setCurrentAssessment, setStartTime, startTime]);

  useEffect(() => {
    if (!showTimerSetting || !startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimerSetting, startTime]);

  const handleRestoreDraft = useCallback(() => {
    if (!draftRecord) return;

    resetQuiz();

    const restoredStartTime = draftRecord.startedAt
      ? new Date(draftRecord.startedAt)
      : new Date();

    const validQuestionIndex = Math.min(
      draftRecord.currentQuestionIndex || 0,
      draftRecord.totalQuestions - 1,
      0
    );

    useQuizStore.setState({
      answers: draftRecord.answers || {},
      currentQuestionIndex: validQuestionIndex,
      isCompleted: false,
      startTime: restoredStartTime,
    });

    setDraftRecord(null);
  }, [draftRecord, resetQuiz]);

  const handleDiscardDraft = useCallback(async () => {
    if (!assessmentId) return;
    await deleteDraftByAssessmentSlug(assessmentId);
    resetQuiz();
    setDraftRecord(null);
  }, [assessmentId, resetQuiz]);

  const handleAutoSave = useCallback(async () => {
    if (!autoSaveDraft || !assessmentId || !assessment || submitting) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) return;

    try {
      await saveDraft({
        assessmentId,
        assessmentSlug: assessment.slug,
        assessmentName: assessment.name,
        category: assessment.category,
        answers,
        currentQuestionIndex,
        totalQuestions: assessment.questions.length,
        startedAt: startTime?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAbandoned: false,
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  }, [autoSaveDraft, assessmentId, assessment, answers, currentQuestionIndex, startTime, submitting]);

  useEffect(() => {
    if (autoSaveDraft && assessment && Object.keys(answers).length > 0) {
      const timeoutId = setTimeout(handleAutoSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [answers, autoSaveDraft, handleAutoSave, assessment]);

  useEffect(() => {
    if (!autoSaveDraft || !assessmentId || !assessment) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const answeredCount = Object.keys(answers).length;
      if (answeredCount === 0) return;

      const draftKey = `humans_os_draft_${assessmentId}`;
      const draftData = {
        assessmentId,
        assessmentSlug: assessment.slug,
        assessmentName: assessment.name,
        category: assessment.category,
        answers,
        currentQuestionIndex,
        totalQuestions: assessment.questions.length,
        startedAt: startTime?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAbandoned: false,
      };

      try {
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      } catch (err) {
        console.error('Failed to save draft before unload:', err);
      }

      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveDraft, assessmentId, assessment, answers, currentQuestionIndex, startTime]);

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsAnswerSheetOpen(false);
  };

  const handleSubmit = async () => {
    if (!assessment || !assessmentId || submitting) return;

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = assessment.questions.length;

    if (answeredCount < totalQuestions) {
      setShowIncompleteWarning(true);
      setTimeout(() => setShowIncompleteWarning(false), 3000);
      return;
    }

    setSubmitting(true);

    try {
      completeQuiz();

      await deleteDraftByAssessmentSlug(assessmentId);

      const resultData = {
        assessmentId,
        answers,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(`quiz_result_${assessmentId}`, JSON.stringify(resultData));

      navigate(`/results/${assessmentId}`);
    } catch (err) {
      console.error('Failed to submit:', err);
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!assessment) return;

    const totalQuestions = assessment.questions.length;

    if (currentQuestionIndex < totalQuestions - 1) {
      nextQuestion();
    } else {
      const answeredCount = Object.keys(answers).length;
      if (answeredCount < totalQuestions) {
        setShowIncompleteWarning(true);
        setTimeout(() => setShowIncompleteWarning(false), 3000);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      prevQuestion();
    }
  };

  const handleOptionSelect = (questionId: string, optionValue: number) => {
    setAnswer(questionId, optionValue);
  };

  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-500 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !assessment) {
    return (
      <PageTransition>
        <div className="min-h-screen px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 flex items-center justify-center"
            >
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || '加载失败'}
            </h2>
            <Button onClick={() => navigate('/categories')}>
              返回测评分类
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const totalQuestions = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const allAnswered = answeredCount === totalQuestions;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const currentAnswer = answers[currentQuestion?.id];

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const questionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-36">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/categories')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800/50"
            >
              返回
            </Button>

            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {assessment.name}
              </h1>
              <span className="px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-primary-100 to-purple-100 text-primary-600 dark:from-primary-900/40 dark:to-purple-900/40 dark:text-primary-400 font-medium">
                {assessment.version}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {assessment.shortDescription}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-primary-500/20">
                    {currentQuestionIndex + 1}
                    <span className="mx-1.5 text-primary-200">/</span>
                    {totalQuestions}
                  </span>
                  {currentQuestionIndex === 0 && (
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary-400 animate-pulse" />
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {assessment.dimensions.find(d => d.id === currentQuestion.dimension)?.name || currentQuestion.dimension}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {showTimerSetting && startTime && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg font-mono">
                    <Clock className="w-4 h-4" />
                    {formatElapsedTime(elapsedTime)}
                  </span>
                )}
              </div>
            </div>

            <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                />
                <div
                  className="absolute inset-0 bg-[length:24px_24px]"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgb(226, 232, 240) 1px, transparent 1px), linear-gradient(to bottom, rgb(226, 232, 240) 1px, transparent 1px)',
                    opacity: 0.3,
                  }}
                />
                <motion.div
                  className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/80 to-transparent"
                  animate={{ opacity: [0.6, 1, 0.6], x: [0, 2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

            <div className="flex justify-between mt-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-green-500">{answeredCount}</span> 已答
              </span>
              <motion.span
                animate={unansweredCount > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={unansweredCount > 0 ? 'text-amber-500 font-medium' : 'text-green-500 font-medium'}
              >
                {unansweredCount > 0 ? `还有 ${unansweredCount} 题未答` : '✓ 全部完成'}
              </motion.span>
            </div>
          </motion.div>

          {autoSaveDraft && lastSaved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg"
            >
              <Save className="w-3.5 h-3.5" />
              <span>上次保存: {lastSaved.toLocaleTimeString('zh-CN')}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              variants={shouldAnimate ? questionVariants : {}}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card
                className="p-6 mb-6 shadow-xl border border-gray-100 dark:border-gray-800/50"
                padding="none"
              >
                <div className="p-6 pb-0 mb-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium mb-4"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {assessment.dimensions.find(d => d.id === currentQuestion.dimension)?.name || currentQuestion.dimension}
                  </motion.div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswer === option.value;
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
                          isSelected
                            ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 shadow-lg shadow-primary-500/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        whileHover={!isSelected ? { scale: 1.01 } : {}}
                        whileTap={{ scale: 0.99 }}
                        initial={false}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="optionBackground"
                            className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        <div className="relative flex items-center gap-4">
                          <motion.span
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0 transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </motion.span>
                          <span className={`flex-1 leading-relaxed font-medium transition-colors ${
                            isSelected
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                          }`}>
                            {option.text}
                          </span>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg"
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </motion.span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showIncompleteWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 rounded-xl shadow-xl shadow-amber-500/30 text-sm font-medium flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              请先完成所有题目，还剩 {unansweredCount} 题未答
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/60 dark:border-gray-700/50 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="mx-auto max-w-2xl px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="shrink-0 transition-all disabled:opacity-50"
              >
                上一题
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsAnswerSheetOpen(true)}
                leftIcon={<List className="w-4 h-4" />}
                className="shrink-0 transition-all"
              >
                答题卡
                <span className="ml-2 px-2 py-0.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 font-medium">
                  {answeredCount}/{totalQuestions}
                </span>
              </Button>

              {isLastQuestion ? (
                <Button
                  variant="primary"
                  onClick={() => setShowSubmitConfirm(true)}
                  rightIcon={<CheckCircle className="w-4 h-4" />}
                  className="shrink-0 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-lg shadow-primary-500/25 transition-all"
                  disabled={!allAnswered}
                >
                  提交
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shrink-0 transition-all"
                >
                  下一题
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isAnswerSheetOpen && (
            <AnswerSheet
              assessment={assessment}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              onJumpToQuestion={handleJumpToQuestion}
              onClose={() => setIsAnswerSheetOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSubmitConfirm && (
            <SubmitConfirmModal
              totalQuestions={totalQuestions}
              onConfirm={handleSubmit}
              onCancel={() => setShowSubmitConfirm(false)}
              submitting={submitting}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {draftRecord && (
            <DraftRestoreModal
              assessmentName={assessment.name}
              onRestore={handleRestoreDraft}
              onDiscard={handleDiscardDraft}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

interface AnswerSheetProps {
  assessment: AssessmentDefinition;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  onJumpToQuestion: (index: number) => void;
  onClose: () => void;
}

const AnswerSheet: React.FC<AnswerSheetProps> = ({
  assessment,
  currentQuestionIndex,
  answers,
  onJumpToQuestion,
  onClose,
}) => {
  const totalQuestions = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-0 right-0 bottom-0 max-h-[75vh] bg-white dark:bg-gray-900 z-50 rounded-t-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              答题卡
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              已答 <span className="text-green-500 font-semibold">{answeredCount}</span> 题 · 未答 <span className={unansweredCount > 0 ? 'text-amber-500 font-semibold' : 'text-gray-500'}>{unansweredCount}</span> 题
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>进度 {(answeredCount / totalQuestions * 100).toFixed(0)}%</span>
            <span>{totalQuestions - answeredCount} 题剩余</span>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[55vh]">
          <div className="grid grid-cols-5 gap-3">
            {assessment.questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <motion.button
                  key={question.id}
                  onClick={() => onJumpToQuestion(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative w-12 h-12 rounded-xl text-sm font-bold transition-all
                    flex items-center justify-center shadow-sm
                    ${isCurrent ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
                    ${isAnswered
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-300 hover:from-green-200 hover:to-emerald-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:from-amber-100 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:to-amber-900/30 hover:text-amber-600 dark:hover:text-amber-300'
                    }
                  `}
                >
                  {index + 1}
                  {isAnswered && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </span>
                  )}
                  {isCurrent && !isAnswered && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </span>
              <span className="text-gray-600 dark:text-gray-400">已答题</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></span>
              <span className="text-gray-600 dark:text-gray-400">未答题</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded ring-2 ring-primary-500"></span>
              <span className="text-gray-600 dark:text-gray-400">当前题</span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <Button variant="primary" className="w-full shadow-lg shadow-primary-500/20" onClick={onClose}>
            继续答题
          </Button>
        </div>
      </motion.div>
    </>
  );
};

interface SubmitConfirmModalProps {
  totalQuestions: number;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  totalQuestions,
  onConfirm,
  onCancel,
  submitting,
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl z-50"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex items-center justify-center"
        >
          <CheckCircle className="w-8 h-8 text-green-500" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          确认提交
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          您已完成全部 <span className="font-semibold text-primary-500">{totalQuestions}</span> 道题目。确认提交后将进入结果页面。
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={submitting}>
            再检查一下
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-lg shadow-primary-500/25"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '确认提交'}
          </Button>
        </div>
      </motion.div>
    </>
  );
};

interface DraftRestoreModalProps {
  assessmentName: string;
  onRestore: () => void;
  onDiscard: () => void;
}

const DraftRestoreModal: React.FC<DraftRestoreModalProps> = ({
  assessmentName,
  onRestore,
  onDiscard,
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl z-50"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center"
        >
          <FileText className="w-8 h-8 text-amber-500" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          发现未完成的测评
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-center">
          您之前开始过「<span className="font-semibold text-primary-500">{assessmentName}</span>」的测评
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 text-center">
          选择「放弃」将清除之前的进度
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onDiscard}>
            放弃
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-lg shadow-primary-500/25"
            onClick={onRestore}
          >
            继续作答
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default Quiz;
