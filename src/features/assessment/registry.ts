import type {
  AssessmentRegistryItem,
  AssessmentDefinition,
  AssessmentCategory,
  AssessmentFamily,
  VersionLevel,
} from '@/shared/types';

const REGISTRY_PATH = 'assessments/registry.json';
const FAMILY_REGISTRY_PATH = 'assessments/family-registry.json';

interface RegistryData {
  version: string;
  lastUpdated: string;
  assessments: AssessmentRegistryItem[];
}

interface FamilyRegistryData {
  version: string;
  lastUpdated: string;
  families: AssessmentFamily[];
}

let cachedRegistry: RegistryData | null = null;
let cachedFamilyRegistry: FamilyRegistryData | null = null;

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

export async function fetchFamilyRegistry(): Promise<FamilyRegistryData> {
  if (cachedFamilyRegistry) {
    return cachedFamilyRegistry;
  }

  try {
    const registryPath = resolvePath(FAMILY_REGISTRY_PATH);
    const response = await fetch(registryPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch family registry: ${response.status}`);
    }
    const data: FamilyRegistryData = await response.json();
    cachedFamilyRegistry = data;
    return data;
  } catch (error) {
    console.error('Error fetching family registry:', error);
    throw error;
  }
}

export async function getAllFamilies(): Promise<AssessmentFamily[]> {
  const familyRegistry = await fetchFamilyRegistry();
  return familyRegistry.families;
}

export async function getFamilyById(familyId: string): Promise<AssessmentFamily | undefined> {
  const familyRegistry = await fetchFamilyRegistry();
  return familyRegistry.families.find(f => f.familyId === familyId);
}

export async function getFamiliesByCategory(category: AssessmentCategory): Promise<AssessmentFamily[]> {
  const familyRegistry = await fetchFamilyRegistry();
  return familyRegistry.families.filter(f => f.category === category);
}

export async function getAssessmentVersions(familyId: string): Promise<AssessmentFamily['versions']> {
  const family = await getFamilyById(familyId);
  return family?.versions || [];
}

export async function getRecommendedVersion(familyId: string): Promise<AssessmentFamily['versions'][0] | undefined> {
  const versions = await getAssessmentVersions(familyId);
  return versions.find(v => v.recommended) || versions[0];
}

export async function getVersionByLevel(familyId: string, level: VersionLevel): Promise<AssessmentFamily['versions'][0] | undefined> {
  const versions = await getAssessmentVersions(familyId);
  return versions.find(v => v.level === level);
}

export async function getAssessmentSlugByVersion(familyId: string, level: VersionLevel): Promise<string | undefined> {
  const version = await getVersionByLevel(familyId, level);
  if (!version) return undefined;
  const slug = `${familyId}-${level}`;
  return slug;
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
    const response = await fetchWithRetry(resolvedPath);
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

async function fetchWithRetry(
  url: string,
  retries = 3,
  retryDelay = 1000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
      console.warn(`Fetch attempt ${attempt + 1} failed for ${url}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  clearTimeout(timeoutId);
  throw new Error('Max retries exceeded');
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
