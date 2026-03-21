import type { ResultRecord } from '@/shared/types/assessment';

export type ResultBlockId = 'ai-report' | 'dimension-chart' | 'career-suggestion' | 'personality-insight';

export interface ResultBlockConfig {
  id: ResultBlockId;
  name: string;
  description: string;
  icon?: string;
  order: number;
  supportedFamilies?: string[];
  supportedCategories?: string[];
}

export interface ResultBlockProps {
  result: ResultRecord;
  resultId: number | null;
  onContinueAssessment?: () => void;
}

export interface ResultBlockPlugin {
  config: ResultBlockConfig;
  component: (props: ResultBlockProps) => React.ReactElement;
}

const resultBlocks: Map<ResultBlockId, ResultBlockPlugin> = new Map();
const blockConfigs: Map<ResultBlockId, ResultBlockConfig> = new Map();

export function registerResultBlock(plugin: ResultBlockPlugin): void {
  if (resultBlocks.has(plugin.config.id)) {
    console.warn(`Result block "${plugin.config.id}" is already registered. Overwriting.`);
  }
  resultBlocks.set(plugin.config.id, plugin);
  blockConfigs.set(plugin.config.id, plugin.config);
}

export function getResultBlock(id: ResultBlockId): ResultBlockPlugin | undefined {
  return resultBlocks.get(id);
}

export function getAllResultBlocks(): ResultBlockPlugin[] {
  return Array.from(resultBlocks.values()).sort((a, b) => a.config.order - b.config.order);
}

export function getResultBlockConfig(id: ResultBlockId): ResultBlockConfig | undefined {
  return blockConfigs.get(id);
}

export function getAllResultBlockConfigs(): ResultBlockConfig[] {
  return Array.from(blockConfigs.values()).sort((a, b) => a.order - b.order);
}

export function getResultBlocksForResult(result: ResultRecord): ResultBlockPlugin[] {
  return getAllResultBlocks().filter(block => {
    if (!block.config.supportedFamilies && !block.config.supportedCategories) {
      return true;
    }
    if (block.config.supportedFamilies && result.familyId) {
      if (block.config.supportedFamilies.includes(result.familyId)) {
        return true;
      }
    }
    if (block.config.supportedCategories && result.category) {
      if (block.config.supportedCategories.includes(result.category)) {
        return true;
      }
    }
    return false;
  });
}
