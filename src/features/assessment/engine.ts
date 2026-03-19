import type { QuestionDefinition } from '@/shared/types';

export interface AssessmentEngine {
  calculateDimensionScores: (
    answers: Record<string, number>,
    questions: QuestionDefinition[]
  ) => Record<string, number>;
  calculateOverallScore: (dimensionScores: Record<string, number>) => number;
  calculateReliability: (answers: Record<string, number>) => number;
  generateResultProfile: (
    dimensionScores: Record<string, number>,
    resultProfiles: Array<{
      id: string;
      conditions: Array<{
        dimension?: string;
        operator: string;
        value: number | string | [number, number];
      }>;
    }>
  ) => string | null;
}

export function createAssessmentEngine(): AssessmentEngine {
  return {
    calculateDimensionScores(
      answers: Record<string, number>,
      questions: QuestionDefinition[]
    ): Record<string, number> {
      const scores: Record<string, number> = {};
      const dimensionMap: Record<string, number[]> = {};

      for (const question of questions) {
        const answer = answers[question.id];
        if (answer !== undefined) {
          if (!dimensionMap[question.dimension]) {
            dimensionMap[question.dimension] = [];
          }
          let value = answer;
          if (question.reverse) {
            const maxValue = Math.max(...question.options.map(o => o.value));
            const minValue = Math.min(...question.options.map(o => o.value));
            value = maxValue + minValue - answer;
          }
          dimensionMap[question.dimension].push(value);
        }
      }

      for (const [dimensionId, values] of Object.entries(dimensionMap)) {
        if (values.length > 0) {
          scores[dimensionId] = Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
        } else {
          scores[dimensionId] = 0;
        }
      }

      return scores;
    },

    calculateOverallScore(dimensionScores: Record<string, number>): number {
      const values = Object.values(dimensionScores);
      if (values.length === 0) return 0;
      return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    },

    calculateReliability(answers: Record<string, number>): number {
      const values = Object.values(answers);
      if (values.length < 2) return 0;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const consistencyIndex = Math.min(stdDev / 10, 1);
      return Math.round(consistencyIndex * 100) / 100;
    },

    generateResultProfile(
      dimensionScores: Record<string, number>,
      resultProfiles: Array<{
        id: string;
        conditions: Array<{
          dimension?: string;
          operator: string;
          value: number | string | [number, number];
        }>;
      }>
    ): string | null {
      for (const profile of resultProfiles) {
        const conditionsMet = profile.conditions.every(condition => {
          if (!condition.dimension) {
            const totalScore = Object.values(dimensionScores).reduce((a, b) => a + b, 0);
            return evaluateCondition(totalScore, condition.operator, condition.value);
          }
          const score = dimensionScores[condition.dimension];
          return evaluateCondition(score, condition.operator, condition.value);
        });

        if (conditionsMet) {
          return profile.id;
        }
      }

      return resultProfiles[0]?.id || null;
    },
  };
}

function evaluateCondition(
  value: number,
  operator: string,
  conditionValue: number | string | [number, number]
): boolean {
  switch (operator) {
    case 'gte':
      return value >= (conditionValue as number);
    case 'lte':
      return value <= (conditionValue as number);
    case 'gt':
      return value > (conditionValue as number);
    case 'lt':
      return value < (conditionValue as number);
    case 'eq':
      return value === conditionValue;
    case 'between':
      const [min, max] = conditionValue as [number, number];
      return value >= min && value <= max;
    default:
      return false;
  }
}

export const assessmentEngine = createAssessmentEngine();
