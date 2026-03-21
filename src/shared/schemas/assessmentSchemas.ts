import { z } from 'zod';

export const AssessmentCategorySchema = z.enum([
  'personality',
  'psychology',
  'cognition',
  'ideology',
  'career',
]);

export const QuestionTypeSchema = z.enum([
  'single-choice',
  'multiple-choice',
  'likert-5',
  'likert-7',
  'ranking',
]);

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const AssessmentStatusSchema = z.enum(['active', 'beta', 'deprecated']);

export const VersionLevelSchema = z.enum(['lite', 'standard', 'expert']);

export const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question option text is required'),
  value: z.number(),
});

export const QuestionDefinitionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Question text is required'),
  type: QuestionTypeSchema,
  options: z.array(QuestionOptionSchema).min(2, 'At least 2 options required'),
  dimension: z.string(),
  reverse: z.boolean().optional(),
  weight: z.number().optional(),
});

export const DimensionDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  weights: z.record(z.string(), z.number()).optional(),
});

export const ResultProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  scores: z.record(z.string(), z.union([z.number(), z.string()])),
  type: z.enum(['dominant', 'secondary', 'balanced', 'varied']).optional(),
  recommendations: z.array(z.string()).optional(),
});

export const ScoringDefinitionSchema = z.object({
  type: z.enum(['sum', 'weighted', 'formula']),
  dimensionScores: z.record(
    z.string(),
    z.object({
      weights: z.record(z.string(), z.number()),
    })
  ).optional(),
  formula: z.string().optional(),
  normalize: z.boolean().optional(),
});

export const VersionInfoSchema = z.object({
  level: VersionLevelSchema,
  name: z.string(),
  description: z.string(),
  estimatedMinutes: z.number().min(1).max(120),
  questionCount: z.number().min(1),
  recommended: z.boolean(),
  status: AssessmentStatusSchema,
});

export const AssessmentFamilySchema = z.object({
  familyId: z.string().min(1),
  familyName: z.string().min(1),
  category: AssessmentCategorySchema,
  description: z.string(),
  shortDescription: z.string(),
  icon: z.string(),
  color: z.string(),
  versions: z.array(VersionInfoSchema).min(1),
  tags: z.array(z.string()),
});

export const AssessmentRegistryItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  familyId: z.string(),
  familyName: z.string(),
  category: AssessmentCategorySchema,
  description: z.string(),
  shortDescription: z.string(),
  estimatedMinutes: z.number(),
  questionCount: z.number(),
  difficulty: DifficultySchema,
  tags: z.array(z.string()),
  filePath: z.string(),
  version: z.string(),
  status: AssessmentStatusSchema,
  versionLevel: VersionLevelSchema.optional(),
  recommended: z.boolean().optional(),
});

export const AssessmentDefinitionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  familyId: z.string(),
  familyName: z.string(),
  category: AssessmentCategorySchema,
  version: z.string(),
  versionLevel: VersionLevelSchema.optional(),
  name: z.string(),
  description: z.string(),
  estimatedMinutes: z.number(),
  questionCount: z.number(),
  dimensions: z.array(DimensionDefinitionSchema),
  questions: z.array(QuestionDefinitionSchema),
  scoring: ScoringDefinitionSchema,
  resultProfiles: z.array(ResultProfileSchema).min(1),
  status: AssessmentStatusSchema,
  recommended: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  lastUpdated: z.string().optional(),
});

export type AssessmentCategory = z.infer<typeof AssessmentCategorySchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;
export type VersionLevel = z.infer<typeof VersionLevelSchema>;
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type QuestionDefinition = z.infer<typeof QuestionDefinitionSchema>;
export type DimensionDefinition = z.infer<typeof DimensionDefinitionSchema>;
export type ResultProfile = z.infer<typeof ResultProfileSchema>;
export type ScoringDefinition = z.infer<typeof ScoringDefinitionSchema>;
export type VersionInfo = z.infer<typeof VersionInfoSchema>;
export type AssessmentFamily = z.infer<typeof AssessmentFamilySchema>;
export type AssessmentRegistryItem = z.infer<typeof AssessmentRegistryItemSchema>;
export type AssessmentDefinition = z.infer<typeof AssessmentDefinitionSchema>;

export function validateAssessmentDefinition(
  data: unknown
): { success: true; data: AssessmentDefinition } | { success: false; errors: z.ZodError } {
  const result = AssessmentDefinitionSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateAssessmentRegistryItem(
  data: unknown
): { success: true; data: AssessmentRegistryItem } | { success: false; errors: z.ZodError } {
  const result = AssessmentRegistryItemSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateAssessmentFamily(
  data: unknown
): { success: true; data: AssessmentFamily } | { success: false; errors: z.ZodError } {
  const result = AssessmentFamilySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
