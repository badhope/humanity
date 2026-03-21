import type { QuestionDefinition } from '@/shared/types/assessment';

export type QuestionTypeId = 'single-choice' | 'multiple-choice' | 'likert-5' | 'likert-7' | 'ranking';

export interface QuestionRendererProps {
  question: QuestionDefinition;
  selectedAnswer: number | undefined;
  onAnswer: (questionId: string, value: number) => void;
  disabled?: boolean;
}

export interface QuestionRendererPlugin {
  type: QuestionTypeId;
  name: string;
  description: string;
  renderer: (props: QuestionRendererProps) => React.ReactElement;
}

const questionRenderers: Map<QuestionTypeId, QuestionRendererPlugin> = new Map();

export function registerQuestionRenderer(plugin: QuestionRendererPlugin): void {
  if (questionRenderers.has(plugin.type)) {
    console.warn(`Question renderer for type "${plugin.type}" is already registered. Overwriting.`);
  }
  questionRenderers.set(plugin.type, plugin);
}

export function getQuestionRenderer(type: QuestionTypeId): QuestionRendererPlugin | undefined {
  return questionRenderers.get(type);
}

export function getAllQuestionRenderers(): QuestionRendererPlugin[] {
  return Array.from(questionRenderers.values());
}

export function getDefaultQuestionRenderer(): QuestionRendererPlugin | undefined {
  return questionRenderers.get('single-choice');
}
