export type AssessmentCategory = 'personality' | 'psychology' | 'cognition' | 'ideology' | 'career';

export type QuestionType = 'single-choice' | 'multiple-choice' | 'likert-5' | 'likert-7' | 'ranking';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AssessmentStatus = 'active' | 'beta' | 'deprecated';

export type VersionLevel = 'lite' | 'standard' | 'expert';

export interface VersionInfo {
  level: VersionLevel;
  name: string;
  description: string;
  estimatedMinutes: number;
  questionCount: number;
  recommended: boolean;
  status: AssessmentStatus;
}

export interface AssessmentFamily {
  familyId: string;
  familyName: string;
  category: AssessmentCategory;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  versions: VersionInfo[];
  tags: string[];
}

export interface AssessmentRegistryItem {
  id: string;
  slug: string;
  name: string;
  familyId: string;
  familyName: string;
  category: AssessmentCategory;
  description: string;
  shortDescription: string;
  estimatedMinutes: number;
  questionCount: number;
  difficulty: Difficulty;
  tags: string[];
  filePath: string;
  version: string;
  status: AssessmentStatus;
  versionLevel?: VersionLevel;
  recommended?: boolean;
}

export interface DimensionDefinition {
  id: string;
  name: string;
  description: string;
  weights?: Record<string, number>;
}

export interface QuestionOption {
  id: string;
  text: string;
  value: number;
}

export interface QuestionDefinition {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  dimension: string;
  reverse?: boolean;
  weight?: number;
}

export interface ScoringDefinition {
  type: 'sum' | 'weighted' | 'formula';
  dimensionScores?: Record<string, { weights: Record<string, number> }>;
  formula?: string;
  normalize?: boolean;
  minScore?: number;
  maxScore?: number;
}

export interface ResultCondition {
  dimension?: string;
  operator: 'gte' | 'lte' | 'gt' | 'lt' | 'eq' | 'between' | 'contains';
  value: number | string | [number, number];
}

export interface ResultProfileDefinition {
  id: string;
  name: string;
  description: string;
  conditions: ResultCondition[];
  tags?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  careers?: string[];
  relationships?: string;
  growth?: string;
}

export interface AssessmentDefinition {
  id: string;
  slug: string;
  name: string;
  category: AssessmentCategory;
  description: string;
  shortDescription: string;
  version: string;
  author: string;
  language: string;
  estimatedMinutes: number;
  questionCount: number;
  difficulty: Difficulty;
  tags: string[];
  dimensions: DimensionDefinition[];
  scoring: ScoringDefinition;
  resultProfiles: ResultProfileDefinition[];
  questions: QuestionDefinition[];
}

export interface AssessmentResult {
  id?: number | string;
  assessmentId: string;
  assessmentSlug: string;
  assessmentName: string;
  category: AssessmentCategory;
  completedAt: Date;
  answers: Record<string, string>;
  rawScores: Record<string, number>;
  dimensionScores: Record<string, number>;
  resultProfileId?: string;
  resultProfileName?: string;
  totalScore?: number;
  percentile?: Record<string, number>;
  analysis?: string;
  reliability?: number;
}

export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  rawScore: number;
  normalizedScore: number;
  percentage: number;
  description: string;
  isPrimary: boolean;
  letter: string;
}

export interface Highlight {
  id: string;
  text: string;
  type: 'strength' | 'trait' | 'preference' | 'potential';
}

export interface Recommendation {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

export interface ResultRecord {
  id?: number;
  assessmentId: string;
  assessmentSlug: string;
  assessmentName: string;
  familyId?: string;
  familyName?: string;
  category: AssessmentCategory;
  version: string;
  versionLevel?: VersionLevel;
  startedAt: string;
  completedAt: string;
  durationSpent: number;
  answerCount: number;
  answers: Record<string, number>;
  rawScores: Record<string, number>;
  normalizedScores: Record<string, number>;
  percentiles: Record<string, number>;
  resultProfileId: string;
  resultProfileName: string;
  resultType: string;
  summary: string;
  highlights: Highlight[];
  recommendations: Recommendation[];
  aiAnalysis: string;
  metadata: Record<string, unknown>;
}

export interface DraftRecord {
  id?: number;
  assessmentId: string;
  assessmentSlug: string;
  assessmentName: string;
  familyId?: string;
  category: AssessmentCategory;
  versionLevel?: VersionLevel;
  answers: Record<string, number>;
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAt: string;
  updatedAt: string;
  isAbandoned: boolean;
}

export interface LocalProfile {
  id?: number;
  nickname: string;
  createdAt: string;
  updatedAt: string;
  totalAssessments: number;
  totalDurationSpent: number;
  lastAssessmentAt: string | null;
  favoriteCategory: AssessmentCategory | null;
  settings: {
    theme: string;
    fontSize: number;
  };
}

export interface CategoryInfo {
  id: AssessmentCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORY_INFO: Record<AssessmentCategory, CategoryInfo> = {
  personality: {
    id: 'personality',
    name: '人格类型',
    description: '探索您的性格特质与行为模式',
    icon: 'Users',
    color: 'purple',
  },
  psychology: {
    id: 'psychology',
    name: '心理特质',
    description: '了解您的情绪与心理状态',
    icon: 'Brain',
    color: 'blue',
  },
  cognition: {
    id: 'cognition',
    name: '认知能力',
    description: '评估您的思维与推理能力',
    icon: 'Lightbulb',
    color: 'yellow',
  },
  ideology: {
    id: 'ideology',
    name: '价值观',
    description: '发现您内心的价值取向',
    icon: 'Compass',
    color: 'green',
  },
  career: {
    id: 'career',
    name: '职业倾向',
    description: '找到最适合您的职业方向',
    icon: 'Briefcase',
    color: 'orange',
  },
};
