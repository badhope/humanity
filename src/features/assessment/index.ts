export { assessmentEngine, createAssessmentEngine, type AssessmentEngine } from './engine';
export { fetchAssessmentRegistry, getAssessmentsByCategory, fetchAssessmentBySlug, fetchAssessmentDefinition } from './registry';
export {
  fetchModuleRegistry,
  getModules,
  getModuleById,
  getActiveModules,
  getModulesByStatus,
  isModuleActive,
  isModuleAccessible,
  getModuleStatusLabel,
  getModuleStatusColor,
  getModuleNavDestination,
  clearModuleRegistryCache,
  type ModuleInfo,
  type ModuleStatus,
} from './moduleService';
