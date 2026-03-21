import type { AssessmentCategory } from './assessment';

export type ModuleStatus = 'active' | 'preparing' | 'maintenance' | 'disabled';

export interface ModuleInfo {
  id: AssessmentCategory;
  name: string;
  slug: AssessmentCategory;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  order: number;
  status: ModuleStatus;
}

export interface ModuleRegistry {
  version: string;
  lastUpdated: string;
  modules: ModuleInfo[];
}
