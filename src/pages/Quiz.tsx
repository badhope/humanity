import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { PageTransition } from '@/components/molecules';
import { Button, Progress, Card } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { fetchAssessmentBySlug } from '@/features/assessment/registry';
import type { AssessmentDefinition } from '@/shared/types';

const Quiz: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { animationLevel, reducedMotion } = useSettingsStore();
  const {
    currentQuestionIndex,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    setCurrentAssessment,
    resetQuiz,
  } = useQuizStore();

  const [assessment, setAssessment] = useState<AssessmentDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setCurrentAssessment(assessmentId);
        resetQuiz();
      } catch (err) {
        console.error('Failed to load assessment:', err);
        setError('加载测评失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [assessmentId, setCurrentAssessment, resetQuiz]);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
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
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
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
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentAnswer = answers[currentQuestion?.id];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const handleOptionSelect = (questionId: string, optionValue: number) => {
    setAnswer(questionId, optionValue);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      nextQuestion();
    } else {
      navigate(`/results/${assessmentId}`);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      prevQuestion();
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            返回
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {assessment.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {assessment.shortDescription}
            </p>
          </motion.div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                第 {currentQuestionIndex + 1} / {totalQuestions} 题
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                约 {assessment.estimatedMinutes} 分钟
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <motion.div
            key={currentQuestion.id}
            variants={reducedMotion || animationLevel === 'none' ? {} : containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="p-6 mb-6">
              <div className="mb-2 text-sm text-primary-500 font-medium">
                {assessment.dimensions.find(d => d.id === currentQuestion.dimension)?.name || currentQuestion.dimension}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {currentQuestion.text}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentAnswer === option.value;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              上一题
            </Button>
            <Button
              onClick={handleNext}
              rightIcon={currentQuestionIndex === totalQuestions - 1 ? undefined : <ArrowRight className="w-4 h-4" />}
            >
              {currentQuestionIndex === totalQuestions - 1 ? '查看结果' : '下一题'}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Quiz;
