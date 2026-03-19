import type {
  AssessmentRegistryItem,
  AssessmentDefinition,
  AssessmentCategory,
} from '@/shared/types';

const REGISTRY_PATH = 'assessments/registry.json';

interface RegistryData {
  version: string;
  lastUpdated: string;
  assessments: AssessmentRegistryItem[];
}

let cachedRegistry: RegistryData | null = null;

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

function resolvePath(path: string): string {
  const base = getBasePath();
  if (base) {
    return `/${base}/${path}`.replace(/\/+/g, '/');
  }
  return `/${path}`.replace(/\/+/g, '/');
}

export async function fetchAssessmentRegistry(): Promise<RegistryData> {
  if (cachedRegistry) {
    return cachedRegistry;
  }

  try {
    const registryPath = resolvePath(REGISTRY_PATH);
    const response = await fetch(registryPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status}`);
    }
    const data: RegistryData = await response.json();
    cachedRegistry = data;
    return data;
  } catch (error) {
    console.error('Error fetching assessment registry:', error);
    throw error;
  }
}

export async function getAssessmentsByCategory(
  category: AssessmentCategory
): Promise<AssessmentRegistryItem[]> {
  const registry = await fetchAssessmentRegistry();
  return registry.assessments.filter((a) => a.category === category);
}

export async function getAllAssessments(): Promise<AssessmentRegistryItem[]> {
  const registry = await fetchAssessmentRegistry();
  return registry.assessments;
}

export async function getAssessmentBySlug(
  slug: string
): Promise<AssessmentRegistryItem | undefined> {
  const registry = await fetchAssessmentRegistry();
  return registry.assessments.find((a) => a.slug === slug);
}

export async function fetchAssessmentDefinition(
  filePath: string
): Promise<AssessmentDefinition> {
  try {
    const cleanPath = filePath.replace(/^\//, '');
    const resolvedPath = resolvePath(cleanPath);
    const response = await fetch(resolvedPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch assessment: ${response.status}`);
    }
    const data: AssessmentDefinition = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching assessment from ${filePath}:`, error);
    throw error;
  }
}

export async function fetchAssessmentBySlug(
  slug: string
): Promise<AssessmentDefinition | null> {
  try {
    const registryItem = await getAssessmentBySlug(slug);
    if (!registryItem) {
      return null;
    }
    return await fetchAssessmentDefinition(registryItem.filePath);
  } catch (error) {
    console.error(`Error fetching assessment by slug ${slug}:`, error);
    throw error;
  }
}

export function clearRegistryCache(): void {
  cachedRegistry = null;
}
