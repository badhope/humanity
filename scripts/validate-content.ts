import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const REGISTRY_PATH = path.join(process.cwd(), 'public', 'assessments', 'registry.json');
const FAMILY_REGISTRY_PATH = path.join(process.cwd(), 'public', 'assessments', 'family-registry.json');
const MODULE_REGISTRY_PATH = path.join(process.cwd(), 'public', 'assessments', 'module-registry.json');
const ASSESSMENTS_DIR = path.join(process.cwd(), 'public', 'assessments');

const QuestionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  value: z.number(),
});

const QuestionDefinitionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  type: z.enum(['single-choice', 'multiple-choice', 'likert-5', 'likert-7', 'ranking']),
  options: z.array(QuestionOptionSchema).min(2),
  dimension: z.string(),
  reverse: z.boolean().optional(),
  weight: z.number().optional(),
});

const DimensionDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  weights: z.record(z.string(), z.number()).optional(),
});

const ConditionSchema = z.object({
  dimension: z.string(),
  operator: z.enum(['lt', 'gt', 'lte', 'gte', 'eq']),
  value: z.union([z.number(), z.string()]),
});

const ResultProfileSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    scores: z.record(z.union([z.number(), z.string()])).optional(),
    conditions: z.array(ConditionSchema).optional(),
    type: z.enum(['dominant', 'secondary', 'balanced', 'varied']).optional(),
    recommendations: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    careers: z.union([z.array(z.string()), z.string()]).optional(),
    relationships: z.string().optional(),
    growth: z.string().optional(),
  })
);

const ScoringDefinitionSchema = z.object({
  type: z.enum(['sum', 'weighted', 'formula']),
  dimensionScores: z.record(
    z.string(),
    z.object({
      weights: z.record(z.string(), z.union([z.number(), z.string()])),
    })
  ).optional(),
  formula: z.string().optional(),
  normalize: z.boolean().optional(),
  minScore: z.number().optional(),
  maxScore: z.number().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _AssessmentDefinitionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  familyId: z.string(),
  familyName: z.string(),
  category: z.enum(['personality', 'psychology', 'cognition', 'ideology', 'career']),
  version: z.string(),
  versionLevel: z.enum(['lite', 'standard', 'expert']).optional(),
  name: z.string(),
  description: z.string(),
  estimatedMinutes: z.number(),
  questionCount: z.number(),
  dimensions: z.array(DimensionDefinitionSchema),
  questions: z.array(QuestionDefinitionSchema),
  scoring: ScoringDefinitionSchema,
  resultProfiles: z.array(ResultProfileSchema).min(1),
  status: z.enum(['active', 'beta', 'deprecated']),
  recommended: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  lastUpdated: z.string().optional(),
});

const VersionInfoSchema = z.object({
  level: z.enum(['lite', 'standard', 'expert']),
  name: z.string(),
  description: z.string(),
  estimatedMinutes: z.number().min(1).max(120),
  questionCount: z.number().min(1),
  recommended: z.boolean(),
  status: z.enum(['active', 'beta', 'deprecated']),
});

const AssessmentFamilySchema = z.object({
  familyId: z.string().min(1),
  familyName: z.string().min(1),
  category: z.enum(['personality', 'psychology', 'cognition', 'ideology', 'career']),
  description: z.string(),
  shortDescription: z.string(),
  icon: z.string(),
  color: z.string(),
  versions: z.array(VersionInfoSchema).min(1),
  tags: z.array(z.string()),
});

const AssessmentRegistryItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  familyId: z.string(),
  familyName: z.string(),
  category: z.enum(['personality', 'psychology', 'cognition', 'ideology', 'career']),
  description: z.string(),
  shortDescription: z.string(),
  estimatedMinutes: z.number(),
  questionCount: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()),
  filePath: z.string(),
  version: z.string(),
  status: z.enum(['active', 'beta', 'deprecated']),
  versionLevel: z.enum(['lite', 'standard', 'expert']).optional(),
  recommended: z.boolean().optional(),
});

interface ValidationError {
  file: string;
  error: string;
}

interface ValidationWarning {
  file: string;
  warning: string;
}

const errors: ValidationError[] = [];
const warnings: ValidationWarning[] = [];

function logError(msg: string) {
  console.error(`❌ ${msg}`);
}

function logSuccess(msg: string) {
  console.log(`✅ ${msg}`);
}

function validateFileExists(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    errors.push({ file: filePath, error: 'File does not exist' });
    return false;
  }
  return true;
}

function readJSON(filePath: string): unknown | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    errors.push({ file: filePath, error: `Failed to parse JSON: ${(e as Error).message}` });
    return null;
  }
}

function findAllAssessmentFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findAllAssessmentFiles(fullPath));
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function validateRegistries() {
  console.log('\n--- Validating Registries ---\n');

  if (!validateFileExists(REGISTRY_PATH)) {
    return;
  }
  const registry = readJSON(REGISTRY_PATH);
  if (!registry) return;

  if (!validateFileExists(FAMILY_REGISTRY_PATH)) {
    return;
  }
  const familyRegistry = readJSON(FAMILY_REGISTRY_PATH);
  if (!familyRegistry) return;

  if (!validateFileExists(MODULE_REGISTRY_PATH)) {
    return;
  }
  const moduleRegistry = readJSON(MODULE_REGISTRY_PATH);
  if (!moduleRegistry) return;

  const registryData = registry as { assessments?: unknown[] };
  if (!Array.isArray(registryData.assessments)) {
    logError('registry.json: assessments is not an array');
    errors.push({ file: REGISTRY_PATH, error: 'assessments is not an array' });
  } else {
    logSuccess(`registry.json: ${registryData.assessments.length} assessments`);
    for (const item of registryData.assessments) {
      const result = AssessmentRegistryItemSchema.safeParse(item);
      if (!result.success) {
        const assessmentItem = item as { id?: string; slug?: string };
        logError(`registry.json: Item ${assessmentItem.id || assessmentItem.slug || 'unknown'} failed validation`);
        errors.push({
          file: REGISTRY_PATH,
          error: `Assessment ${assessmentItem.id}: ${result.error.message}`,
        });
      }
    }
  }

  const familyData = familyRegistry as { families?: unknown[] };
  if (!Array.isArray(familyData.families)) {
    logError('family-registry.json: families is not an array');
    errors.push({ file: FAMILY_REGISTRY_PATH, error: 'families is not an array' });
  } else {
    logSuccess(`family-registry.json: ${familyData.families.length} families`);
    for (const family of familyData.families) {
      const result = AssessmentFamilySchema.safeParse(family);
      if (!result.success) {
        const familyItem = family as { familyId?: string };
        logError(`family-registry.json: Family ${familyItem.familyId} failed validation`);
        errors.push({
          file: FAMILY_REGISTRY_PATH,
          error: `Family ${familyItem.familyId}: ${result.error.message}`,
        });
      }
    }
  }
}

async function validateAssessmentFiles() {
  console.log('\n--- Validating Assessment Files ---\n');

  const assessmentFiles = findAllAssessmentFiles(ASSESSMENTS_DIR)
    .filter(f => !f.includes('registry') && !f.includes('module-registry'));

  logSuccess(`Found ${assessmentFiles.length} assessment JSON files`);

  for (const filePath of assessmentFiles) {
    const data = readJSON(filePath);
    if (!data) continue;

    const relativePath = path.relative(process.cwd(), filePath);

    if (!(data as Record<string, unknown>).id) {
      logError(`${relativePath}: Missing required field "id"`);
      errors.push({ file: relativePath, error: 'Missing required field "id"' });
      continue;
    }

    if (!(data as Record<string, unknown>).questions) {
      logError(`${relativePath}: Missing required field "questions"`);
      errors.push({ file: relativePath, error: 'Missing required field "questions"' });
      continue;
    }

    if (!(data as Record<string, unknown>).dimensions) {
      logError(`${relativePath}: Missing required field "dimensions"`);
      errors.push({ file: relativePath, error: 'Missing required field "dimensions"' });
      continue;
    }

    if (!(data as Record<string, unknown>).resultProfiles) {
      logError(`${relativePath}: Missing required field "resultProfiles"`);
      errors.push({ file: relativePath, error: 'Missing required field "resultProfiles"' });
      continue;
    }

    const assessment = data as {
      id: string;
      questions?: unknown[];
      dimensions?: unknown[];
      resultProfiles?: unknown[];
      questionCount?: number;
    };

    if (!Array.isArray(assessment.questions)) {
      logError(`${relativePath}: questions is not an array`);
      errors.push({ file: relativePath, error: 'questions is not an array' });
      continue;
    }

    if (!Array.isArray(assessment.dimensions)) {
      logError(`${relativePath}: dimensions is not an array`);
      errors.push({ file: relativePath, error: 'dimensions is not an array' });
      continue;
    }

    if (!Array.isArray(assessment.resultProfiles)) {
      logError(`${relativePath}: resultProfiles is not an array`);
      errors.push({ file: relativePath, error: 'resultProfiles is not an array' });
      continue;
    }

    const dimensionIds = new Set(
      (assessment.dimensions as Array<{ id: string }>).map(d => d.id)
    );

    for (const q of assessment.questions as Array<{ id?: string; dimension?: string }>) {
      if (!q.id) {
        errors.push({ file: relativePath, error: `Question missing id` });
      }
      if (q.dimension && !dimensionIds.has(q.dimension)) {
        errors.push({
          file: relativePath,
          error: `Question ${q.id || 'unknown'} references unknown dimension "${q.dimension}"`,
        });
      }
    }

    for (const profile of assessment.resultProfiles as Array<{ id?: string; scores?: unknown; conditions?: unknown }>) {
      if (!profile.id) {
        errors.push({ file: relativePath, error: 'Result profile missing id' });
      }
      if (!profile.scores && !profile.conditions) {
        warnings.push({
          file: relativePath,
          warning: `Result profile ${profile.id || 'unknown'} has neither scores nor conditions`,
        });
      }
    }

    if (assessment.questionCount !== undefined && assessment.questions.length !== assessment.questionCount) {
      warnings.push({
        file: relativePath,
        warning: `questionCount (${assessment.questionCount}) does not match questions.length (${assessment.questions.length})`,
      });
    }

    if ((data as { status?: string }).status === 'active' && assessment.questions.length === 0) {
      warnings.push({
        file: relativePath,
        warning: 'Assessment is marked active but has no questions',
      });
    }

    logSuccess(`${relativePath}: OK (${assessment.questions.length} questions, ${assessment.dimensions.length} dimensions)`);
  }
}

async function validateFilePaths() {
  console.log('\n--- Validating File Paths in Registry ---\n');

  const registry = readJSON(REGISTRY_PATH) as { assessments?: Array<{ filePath?: string; id?: string }> };
  if (!registry?.assessments) return;

  for (const item of registry.assessments) {
    if (!item.filePath) continue;

    const fullPath = path.join(process.cwd(), 'public', item.filePath.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) {
      errors.push({
        file: REGISTRY_PATH,
        error: `Registry references non-existent file: ${item.filePath} (for ${item.id})`,
      });
      logError(`registry.json: References non-existent file ${item.filePath} for ${item.id}`);
    }
  }
}

async function main() {
  console.log('===========================================');
  console.log('   HumanOS Content Validation Script');
  console.log('===========================================');

  await validateRegistries();
  await validateAssessmentFiles();
  await validateFilePaths();

  console.log('\n===========================================');
  console.log('   Validation Summary');
  console.log('===========================================');

  if (errors.length > 0) {
    console.log(`\n❌ Found ${errors.length} error(s):\n`);
    for (const e of errors) {
      console.log(`  ${e.file}: ${e.error}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Found ${warnings.length} warning(s):\n`);
    for (const w of warnings) {
      console.log(`  ${w.file}: ${w.warning}`);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All validations passed!\n');
  } else if (errors.length === 0) {
    console.log('\n✅ No errors, but please review warnings above.\n');
  } else {
    console.log('\n❌ Validation failed. Please fix errors above.\n');
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Validation script failed:', e);
  process.exit(1);
});
