import type { AssessmentDefinition, AssessmentFamily } from '@/shared/types';

interface ContentLoadResult<T> {
  success: true;
  data: T;
}

interface ContentLoadError {
  success: false;
  error: string;
  code: 'NOT_FOUND' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR';
}

export type { ContentLoadResult, ContentLoadError };

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface AssessmentValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  data?: AssessmentDefinition;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

function resolve(contentPath: string): string {
  const base = getBasePath();
  if (base) {
    return `/${base}/${contentPath}`.replace(/\/+/g, '/');
  }
  return `/${contentPath}`.replace(/\/+/g, '/');
}

export { getBasePath, resolve };

const assessmentCache = new Map<string, AssessmentDefinition>();
const familyCache = new Map<string, AssessmentFamily>();

interface FetchOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, timeout = 10000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'same-origin',
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt === retries) {
        clearTimeout(timeoutId);
        throw error;
      }
      console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  clearTimeout(timeoutId);
  throw new Error('Max retries exceeded');
}

export async function loadAssessment(filePath: string): Promise<AssessmentDefinition> {
  if (assessmentCache.has(filePath)) {
    return assessmentCache.get(filePath)!;
  }

  const resolvedPath = resolve(filePath);

  try {
    const response = await fetchWithRetry(resolvedPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const data = JSON.parse(text);

    const validation = validateAssessmentSync(data);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    assessmentCache.set(filePath, validation.data!);
    return validation.data!;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON from ${filePath}: ${error.message}`);
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout for ${filePath}`);
    }
    throw error;
  }
}

export async function loadAssessmentSafe(filePath: string): Promise<ContentLoadResult<AssessmentDefinition> | ContentLoadError> {
  try {
    const data = await loadAssessment(filePath);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('HTTP 404') || message.includes('Failed to fetch')) {
      return { success: false, error: message, code: 'NOT_FOUND' };
    }
    if (message.includes('JSON') || message.includes('parse')) {
      return { success: false, error: message, code: 'PARSE_ERROR' };
    }
    if (message.includes('Validation')) {
      return { success: false, error: message, code: 'VALIDATION_ERROR' };
    }
    return { success: false, error: message, code: 'NETWORK_ERROR' };
  }
}

export async function loadFamily(familyId: string): Promise<AssessmentFamily | null> {
  if (familyCache.has(familyId)) {
    return familyCache.get(familyId)!;
  }

  try {
    const registryPath = resolve('assessments/family-registry.json');
    const response = await fetch(registryPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch family registry: ${response.status}`);
    }

    const data = await response.json();
    const family = data.families?.find((f: AssessmentFamily) => f.familyId === familyId);

    if (family) {
      familyCache.set(familyId, family);
    }

    return family || null;
  } catch (error) {
    console.error(`Error loading family ${familyId}:`, error);
    return null;
  }
}

export function validateAssessmentSync(data: unknown): AssessmentValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Data must be an object', severity: 'error' }],
      warnings: [],
    };
  }

  const obj = data as Record<string, unknown>;

  const requiredStrings: Array<[string, string]> = [
    ['id', 'ID'],
    ['slug', 'Slug'],
    ['familyId', 'Family ID'],
    ['familyName', 'Family Name'],
    ['name', 'Name'],
    ['description', 'Description'],
    ['version', 'Version'],
    ['category', 'Category'],
  ];

  for (const [field, label] of requiredStrings) {
    if (!obj[field]) {
      errors.push({ field, message: `Missing required field: ${label}`, severity: 'error' });
    }
  }

  if (obj.category && !['personality', 'psychology', 'cognition', 'ideology', 'career'].includes(obj.category as string)) {
    errors.push({ field: 'category', message: `Invalid category: ${obj.category}`, severity: 'error' });
  }

  if (obj.status && !['active', 'beta', 'deprecated'].includes(obj.status as string)) {
    errors.push({ field: 'status', message: `Invalid status: ${obj.status}`, severity: 'error' });
  }

  if (!Array.isArray(obj.questions)) {
    errors.push({ field: 'questions', message: 'Questions must be an array', severity: 'error' });
  } else if (obj.questions.length === 0) {
    warnings.push({ field: 'questions', message: 'Assessment has no questions', severity: 'warning' });
  }

  if (!Array.isArray(obj.dimensions)) {
    errors.push({ field: 'dimensions', message: 'Dimensions must be an array', severity: 'error' });
  } else if (obj.dimensions.length === 0) {
    warnings.push({ field: 'dimensions', message: 'Assessment has no dimensions', severity: 'warning' });
  }

  if (!Array.isArray(obj.resultProfiles)) {
    errors.push({ field: 'resultProfiles', message: 'Result profiles must be an array', severity: 'error' });
  } else if (obj.resultProfiles.length === 0) {
    errors.push({ field: 'resultProfiles', message: 'At least one result profile is required', severity: 'error' });
  }

  if (Array.isArray(obj.questions) && Array.isArray(obj.dimensions)) {
    const dimensionIds = new Set(obj.dimensions.map((d: Record<string, unknown>) => d.id as string));

    for (const q of obj.questions as Array<{ id?: string; dimension?: string }>) {
      if (!q.id) {
        errors.push({ field: 'questions', message: 'Question missing ID', severity: 'error' });
      }
      if (q.dimension && !dimensionIds.has(q.dimension)) {
        errors.push({
          field: `question.${q.id}.dimension`,
          message: `References unknown dimension: ${q.dimension}`,
          severity: 'error',
        });
      }
    }
  }

  if (typeof obj.questionCount === 'number' && Array.isArray(obj.questions)) {
    if (obj.questionCount !== obj.questions.length) {
      warnings.push({
        field: 'questionCount',
        message: `questionCount (${obj.questionCount}) differs from actual questions.length (${obj.questions.length})`,
        severity: 'warning',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: errors.length === 0 ? (data as AssessmentDefinition) : undefined,
  };
}

export function clearContentCache(): void {
  assessmentCache.clear();
  familyCache.clear();
}

export function getCacheStats(): { assessmentCount: number; familyCount: number } {
  return {
    assessmentCount: assessmentCache.size,
    familyCount: familyCache.size,
  };
}
