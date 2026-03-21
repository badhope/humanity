import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, RefreshCw, CheckCircle, Clock, BarChart3, Sparkles, FileText } from 'lucide-react';
import { PageTransition } from '@/components/molecules';
import { Button, Card, Badge, Progress } from '@/components/atoms';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuizStore } from '@/store/quizStore';
import { fetchAssessmentBySlug } from '@/features/assessment/registry';
import {
  calculateMBTIScores,
  getResultProfile,
  generateDimensionDescriptions,
  generateRecommendations,
} from '@/features/assessment/scoring';
import { saveResult, getLatestResultByAssessmentSlug, getResultByResultId } from '@/features/storage/resultService';
import { syncProfileFromResults } from '@/features/storage/profileService';
import AIReportBlock from '@/components/blocks/AIReportBlock';
import type { ResultRecord } from '@/shared/types';

interface DimensionResult {
  name: string;
  letter: string;
  score: number;
  percentage: number;
  description: string;
  isPrimary: boolean;
}

interface FullResultData {
  id?: number;
  assessmentId: string;
  assessmentSlug: string;
  assessmentName: string;
  mbtiType: string;
  typeName: string;
  typeDescription: string;
  overallScore: number;
  dimensions: DimensionResult[];
  strengths: string[];
  potentialRisks: string[];
  relationships: string;
  recommendations: string[];
  careers: string[];
  durationSpent: number;
  answerCount: number;
  completedAt: string;
  category: string;
}

const Results: FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { animationLevel, reducedMotion } = useSettingsStore();
  const storeAnswers = useQuizStore((state) => state.answers);
  const storeIsCompleted = useQuizStore((state) => state.isCompleted);
  const startTime = useQuizStore((state) => state.startTime);
  const { resetQuiz } = useQuizStore();

  const [resultData, setResultData] = useState<FullResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRestoredFromStorage, setIsRestoredFromStorage] = useState(false);
  const [resultId, setResultId] = useState<number | null>(null);
  const [savingResult, setSavingResult] = useState(false);
  const [savedResultRecord, setSavedResultRecord] = useState<ResultRecord | null>(null);

  useEffect(() => {
    async function loadResult() {
      if (!assessmentId) {
        setError('测评 ID 不存在');
        setLoading(false);
        return;
      }

      const resultIdParam = searchParams.get('resultId');
      let loadedResult: ResultRecord | null = null;
      let answers: Record<string, number> = {};
      let isCompleted = storeIsCompleted;
      let resultSource: 'store' | 'storage' | 'db' = 'store';

      if (resultIdParam) {
        const rid = parseInt(resultIdParam, 10);
        if (!isNaN(rid)) {
          const result = await getResultByResultId(rid);
          if (result) {
            loadedResult = result;
            answers = loadedResult.answers;
            isCompleted = true;
            resultSource = 'db';
          }
        }
      }

      if (!loadedResult) {
        const result = await getLatestResultByAssessmentSlug(assessmentId);
        if (result) {
          loadedResult = result;
          answers = loadedResult.answers;
          isCompleted = true;
          resultSource = 'db';
        }
      }

      if (!loadedResult && (!isCompleted || Object.keys(storeAnswers).length === 0)) {
        const storedData = localStorage.getItem(`quiz_result_${assessmentId}`);
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            if (parsed.assessmentId === assessmentId && parsed.answers) {
              answers = parsed.answers;
              isCompleted = true;
              resultSource = 'storage';
              setIsRestoredFromStorage(true);
            }
          } catch (e) {
            console.error('Failed to parse stored result:', e);
          }
        }
      }

      if (!isCompleted || Object.keys(answers).length === 0) {
        setError('请先完成测评');
        setLoading(false);
        return;
      }

      try {
        const assessmentData = await fetchAssessmentBySlug(assessmentId);
        if (!assessmentData) {
          setError('未找到该测评');
          setLoading(false);
          return;
        }

        const { dimensionScores, mbtiType } = calculateMBTIScores(assessmentData, answers);
        const profile = getResultProfile(assessmentData, mbtiType, dimensionScores);
        const dimensionDescriptions = generateDimensionDescriptions(dimensionScores);
        const recommendations = generateRecommendations(mbtiType, dimensionScores);

        const dimensionMap: Record<string, { left: string; right: string }> = {
          EI: { left: '内向 I', right: '外向 E' },
          SN: { left: '感觉 S', right: '直觉 N' },
          TF: { left: '情感 F', right: '思考 T' },
          JP: { left: '知觉 P', right: '判断 J' },
        };

        const dimensions: DimensionResult[] = Object.entries(dimensionScores).map(([dim, score]) => {
          const [left, right] = dim === 'EI' || dim === 'SN' || dim === 'TF' || dim === 'JP'
            ? [dimensionMap[dim].left, dimensionMap[dim].right]
            : [dim, dim];
          const percentage = Math.min(100, Math.max(0, ((score + 2) / 4) * 100));
          const isPrimary = Math.abs(score) >= 0.5;

          return {
            name: dim,
            letter: score >= 0 ? right[0] : left[0],
            score,
            percentage,
            description: dimensionDescriptions[dim] || '',
            isPrimary,
          };
        });

        const strengths = getStrengths(mbtiType);
        const potentialRisks = getPotentialRisks(mbtiType);
        const relationships = getRelationships(mbtiType);
        const careers = profile?.careers || getDefaultCareers(mbtiType);

        const durationSpent = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : (loadedResult?.durationSpent || 0);

        const fullResult: FullResultData = {
          assessmentId,
          assessmentSlug: assessmentData.slug,
          assessmentName: assessmentData.name,
          mbtiType,
          typeName: profile?.name || `${mbtiType}型`,
          typeDescription: profile?.description || `${mbtiType}是一种有趣的人格类型。`,
          overallScore: Math.round((dimensions.reduce((sum, d) => sum + Math.abs(d.percentage - 50), 0) / 4) * 2),
          dimensions,
          strengths,
          potentialRisks,
          relationships,
          recommendations,
          careers,
          durationSpent,
          answerCount: Object.keys(answers).length,
          completedAt: loadedResult?.completedAt || new Date().toISOString(),
          category: assessmentData.category,
        };

        setResultData(fullResult);

        if (resultSource !== 'db') {
          setSavingResult(true);
          try {
            const resultRecord: Omit<ResultRecord, 'id'> = {
              assessmentId,
              assessmentSlug: assessmentData.slug,
              assessmentName: assessmentData.name,
              category: assessmentData.category,
              version: assessmentData.version,
              startedAt: startTime?.toISOString() || new Date().toISOString(),
              completedAt: new Date().toISOString(),
              durationSpent,
              answerCount: Object.keys(answers).length,
              answers,
              rawScores: dimensionScores,
              normalizedScores: dimensionScores,
              percentiles: {},
              resultProfileId: profile?.id || mbtiType,
              resultProfileName: profile?.name || `${mbtiType}型`,
              resultType: mbtiType,
              summary: profile?.description || `${mbtiType}是一种有趣的人格类型。`,
              highlights: strengths.map((s, i) => ({ id: `h${i}`, text: s, type: 'strength' as const })),
              recommendations: recommendations.map((r, i) => ({ id: `r${i}`, text: r, priority: 'medium' as const })),
              aiAnalysis: '',
              metadata: {},
            };

            const savedId = await saveResult(resultRecord);
            setResultId(savedId);
            setSavedResultRecord(resultRecord);
            if (loadedResult?.id) {
              setResultId(loadedResult.id);
              setSavedResultRecord(loadedResult);
            }

            await syncProfileFromResults();

            localStorage.removeItem(`quiz_result_${assessmentId}`);
          } catch (err) {
            console.error('Failed to save result:', err);
          } finally {
            setSavingResult(false);
          }
        } else if (loadedResult?.id) {
          setResultId(loadedResult.id);
          setSavedResultRecord(loadedResult);
        }
      } catch (err) {
        console.error('Failed to load result:', err);
        setError('加载结果失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [assessmentId, storeAnswers, storeIsCompleted, startTime, searchParams]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reducedMotion || animationLevel === 'none' ? 0 : 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">正在分析您的答案...</p>
        </div>
      </PageTransition>
    );
  }

  if (error || !resultData) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <p className="text-red-500 mb-4">{error || '结果加载失败'}</p>
          <Button onClick={() => navigate('/categories')}>返回首页</Button>
        </div>
      </PageTransition>
    );
  }

  const handleViewHistory = () => {
    navigate('/profile?tab=history');
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="mb-6"
          >
            返回首页
          </Button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 text-center"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-primary-500/20 blur-2xl rounded-full" />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 shadow-xl"
              >
                <span className="text-4xl font-bold text-white">{resultData.mbtiType}</span>
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            </div>

            <Badge variant="success" className="mb-4">
              <span className="mr-1">✓</span> 测评完成
              {isRestoredFromStorage && ' (已恢复)'}
              {savingResult && ' (保存中...)'}
              {resultId && !savingResult && ` (已保存 #${resultId})`}
            </Badge>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2 text-4xl font-bold text-gray-900 dark:text-white"
            >
              {resultData.typeName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-primary-500 font-medium mb-4"
            >
              {resultData.mbtiType} 人格类型
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <Clock className="w-4 h-4" />
                <span>{Math.round(resultData.durationSpent / 60)} 分钟</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <FileText className="w-4 h-4" />
                <span>{resultData.answerCount} 道题</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {resultData.typeDescription}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                四维人格分析
              </h2>
              <div className="space-y-4">
                {resultData.dimensions.map((dim) => (
                  <Card key={dim.name} className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {dim.letter}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">vs</span>
                        <span className="text-lg text-gray-600 dark:text-gray-400">
                          {getOppositeLetter(dim.letter)}
                        </span>
                      </div>
                      <span className={`font-semibold ${dim.isPrimary ? 'text-primary-500' : 'text-gray-500'}`}>
                        {Math.round(dim.percentage)}%
                      </span>
                    </div>
                    <Progress
                      value={dim.percentage}
                      className="h-3"
                      colorScheme={dim.isPrimary ? 'primary' : 'success'}
                    />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {dim.description}
                    </p>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                性格优势
              </h2>
              <Card className="p-4">
                <ul className="space-y-2">
                  {resultData.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-primary-500 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                潜在成长空间
              </h2>
              <Card className="p-4">
                <ul className="space-y-2">
                  {resultData.potentialRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-amber-500 mt-1">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                人际关系
              </h2>
              <Card className="p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {resultData.relationships}
                </p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                成长建议
              </h2>
              <Card className="p-4">
                <ul className="space-y-2">
                  {resultData.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-amber-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {resultId && savedResultRecord && (
              <motion.div variants={itemVariants}>
                <AIReportBlock result={savedResultRecord} resultId={resultId} />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                适合的职业方向
              </h2>
              <Card className="p-4">
                <div className="flex flex-wrap gap-2">
                  {resultData.careers.map((career, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm"
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  leftIcon={<Share2 className="w-4 h-4" />}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `我的 MBTI 是 ${resultData.mbtiType}`,
                        text: resultData.typeDescription,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  分享
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    resetQuiz();
                    navigate(`/quiz/${assessmentId}`);
                  }}
                >
                  重新测试
                </Button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleViewHistory}
              >
                查看历史记录
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/categories')}
              >
                返回测评分类
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

function getOppositeLetter(letter: string): string {
  const opposites: Record<string, string> = {
    E: 'I', I: 'E',
    S: 'N', N: 'S',
    T: 'F', F: 'T',
    J: 'P', P: 'J',
  };
  return opposites[letter] || letter;
}

function getStrengths(mbtiType: string): string[] {
  const strengths: string[] = [];
  const firstLetter = mbtiType[0];
  const thirdLetter = mbtiType[2];

  if (firstLetter === 'E') {
    strengths.push('社交能力强，善于与人交流和建立联系');
    strengths.push('能够快速适应新环境，充满活力');
  } else {
    strengths.push('深思熟虑，善于独立分析和解决问题');
    strengths.push('专注力强，能够长时间集中精力在重要事务上');
  }

  if (thirdLetter === 'T') {
    strengths.push('逻辑思维清晰，善于客观分析利弊');
    strengths.push('决策理性，不易被情感左右');
  } else {
    strengths.push('富有同理心，善于理解和支持他人');
    strengths.push('决策考虑多方感受，人际协调能力强');
  }

  return strengths;
}

function getPotentialRisks(mbtiType: string): string[] {
  const risks: string[] = [];
  const firstLetter = mbtiType[0];
  const thirdLetter = mbtiType[2];
  const fourthLetter = mbtiType[3];

  if (firstLetter === 'E') {
    risks.push('有时可能过于冲动，需要学会独处和内省');
  } else {
    risks.push('可能过于封闭，需要主动走出舒适区');
  }

  if (thirdLetter === 'T') {
    risks.push('有时可能显得过于冷酷，需要注意情感表达');
  } else {
    risks.push('决策可能受情感影响过大，需要平衡理性考量');
  }

  if (fourthLetter === 'J') {
    risks.push('可能过于固执，需要学会接受变化和不确定性');
  } else {
    risks.push('可能缺乏计划性，需要建立更清晰的目标');
  }

  return risks;
}

function getRelationships(mbtiType: string): string {
  const relationshipMap: Record<string, string> = {
    'INTJ': '您倾向于独立思考，在关系中寻求深度和理解。您欣赏能力和智慧，但也需要学会表达情感和接受他人的支持。',
    'INTP': '您是思想的探索者，在亲密关系中重视智识交流和独立性。您需要学会更多地表达情感，而不是仅仅停留在思考层面。',
    'ENTJ': '您果断且有领导力，在关系中倾向于主动和直接。请注意在表达关切时平衡果断与温柔。',
    'ENTP': '您充满创意和好奇心，在关系中喜欢智识碰撞和新鲜感。请记得在追逐可能性时珍惜已建立的情感联系。',
    'INFJ': '您理想主义且富有同理心，在关系中追求深度的精神连接。请学会照顾自己的需求，而不仅是他人的期望。',
    'INFP': '您温柔且有理想，在关系中重视情感的真实和深度。请勇敢表达自己的需求和边界。',
    'ENFJ': '您热情且有感染力，善于激励和理解他人。请注意不要过度牺牲自己来满足他人。',
    'ENFP': '您充满热情和创意，在关系中带来活力和新鲜感。请学会在自由探索和承诺之间找到平衡。',
    'ISTJ': '您务实可靠，在关系中重视责任和承诺。请记得表达情感，让伴侣感受到您的爱意。',
    'ISFJ': '您温柔体贴，善于照顾他人需求。请学会接受他人的关心，而不只是付出。',
    'ESTJ': '您务实有责任感，在关系中重视秩序和效率。请记得在规划中留出浪漫和弹性。',
    'ESFJ': '您热情友善，在关系中重视和谐和关怀。请学会说"不"，并尊重自己的需求。',
    'ISTP': '您冷静务实，在关系中给予空间和自由。请主动表达您的关心，而不只是通过行动。',
    'ISFP': '您温柔敏感，在关系中重视当下的美好体验。请学会为未来做规划，而不是只看现在。',
    'ESTP': '您充满活力，享受生活的刺激。请学会倾听和深入交流，而不只是表面的社交。',
    'ESFP': '您乐观开朗，在关系中带来欢乐和活力。请学会面对困难时的深度情感交流。',
  };
  return relationshipMap[mbtiType] || '每个人都是独特的，您的性格特点会影响您的人际关系模式。';
}

function getDefaultCareers(mbtiType: string): string[] {
  const careerMap: Record<string, string[]> = {
    'INTJ': ['战略咨询师', '金融分析师', '软件架构师', '科研人员'],
    'INTP': ['研究员', '数据科学家', '哲学家', '软件工程师'],
    'ENTJ': ['企业高管', '律师', '管理咨询师', '创业者'],
    'ENTP': ['企业家', '投资人', '律师', '公关专家'],
    'INFJ': ['心理咨询师', '作家', '社会工作者', '人力资源总监'],
    'INFP': ['作家', '艺术家', '心理咨询师', '语言治疗师'],
    'ENFJ': ['教师', '人力资源经理', '心理咨询师', '培训师'],
    'ENFP': ['营销顾问', '记者', '演员', '摄影师'],
    'ISTJ': ['财务会计', '审计师', '律师', '行政经理'],
    'ISFJ': ['护士', '人力资源助理', '图书馆员', '社会工作者'],
    'ESTJ': ['项目经理', '银行经理', '质量管理师', '保险代理人'],
    'ESFJ': ['教师', '护士', '人力资源经理', '客户服务顾问'],
    'ISTP': ['工程师', '机械师', '飞行员', '运动员'],
    'ISFP': ['艺术家', '设计师', '摄影师', '插画师'],
    'ESTP': ['企业家', '销售经理', '旅游代理', '活动策划'],
    'ESFP': ['演员', '主持人', '营销人员', '公关专员'],
  };
  return careerMap[mbtiType] || ['职业探索中'];
}

export default Results;
