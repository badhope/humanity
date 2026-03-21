import type { ModuleRegistry, ModuleInfo, ModuleStatus, AssessmentCategory } from '@/shared/types';

export type { ModuleInfo, ModuleStatus };

const MODULE_REGISTRY_PATH = 'assessments/module-registry.json';

let cachedModuleRegistry: ModuleRegistry | null = null;

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

export async function fetchModuleRegistry(): Promise<ModuleRegistry> {
  if (cachedModuleRegistry) {
    return cachedModuleRegistry;
  }

  try {
    const registryPath = resolvePath(MODULE_REGISTRY_PATH);
    const response = await fetch(registryPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch module registry: ${response.status}`);
    }
    const data: ModuleRegistry = await response.json();
    cachedModuleRegistry = data;
    return data;
  } catch (error) {
    console.error('Error fetching module registry:', error);
    throw error;
  }
}

export async function getModules(): Promise<ModuleInfo[]> {
  const registry = await fetchModuleRegistry();
  return registry.modules;
}

export async function getModuleById(id: AssessmentCategory): Promise<ModuleInfo | undefined> {
  const registry = await fetchModuleRegistry();
  return registry.modules.find(m => m.id === id);
}

export async function getActiveModules(): Promise<ModuleInfo[]> {
  const registry = await fetchModuleRegistry();
  return registry.modules.filter(m => m.status === 'active');
}

export async function getModulesByStatus(status: ModuleStatus): Promise<ModuleInfo[]> {
  const registry = await fetchModuleRegistry();
  return registry.modules.filter(m => m.status === status);
}

export function isModuleActive(module: ModuleInfo): boolean {
  return module.status === 'active';
}

export function isModuleAccessible(module: ModuleInfo): boolean {
  return module.status === 'active';
}

export function getModuleStatusLabel(status: ModuleStatus): string {
  const labels: Record<ModuleStatus, string> = {
    active: '可用',
    preparing: '准备中',
    maintenance: '维护中',
    disabled: '已下线',
  };
  return labels[status] || status;
}

export function getModuleStatusColor(status: ModuleStatus): string {
  const colors: Record<ModuleStatus, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    preparing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    disabled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getModuleNavDestination(module: ModuleInfo): string {
  switch (module.status) {
    case 'active':
      return `/assessments/${module.id}`;
    case 'preparing':
    case 'maintenance':
    case 'disabled':
      return `/maintenance?module=${module.id}&name=${encodeURIComponent(module.name)}`;
    default:
      return `/maintenance?module=${module.id}&name=${encodeURIComponent(module.name)}`;
  }
}

export function clearModuleRegistryCache(): void {
  cachedModuleRegistry = null;
}
