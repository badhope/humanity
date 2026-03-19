export const ASSESSMENT_CATEGORIES = {
  personality: {
    id: 'personality',
    name: '人格类型',
    description: '探索你的性格特质与行为模式',
    icon: 'User',
  },
  psychology: {
    id: 'psychology',
    name: '心理特质',
    description: '了解你的情绪、压力与心理状态',
    icon: 'Brain',
  },
  cognition: {
    id: 'cognition',
    name: '认知能力',
    description: '测试你的智力、记忆与思维能力',
    icon: 'Lightbulb',
  },
  ideology: {
    id: 'ideology',
    name: '价值观',
    description: '探索你的信念与价值取向',
    icon: 'Compass',
  },
  career: {
    id: 'career',
    name: '职业倾向',
    description: '发现适合你的职业发展方向',
    icon: 'Briefcase',
  },
} as const;

export const ANIMATION_CONFIG = {
  none: {
    duration: 0,
    stagger: 0,
  },
  low: {
    duration: 0.3,
    stagger: 0.05,
  },
  medium: {
    duration: 0.5,
    stagger: 0.1,
  },
  high: {
    duration: 0.8,
    stagger: 0.15,
  },
};
