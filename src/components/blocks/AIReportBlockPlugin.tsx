import type { FC } from 'react';
import { registerResultBlock } from '@/shared/plugins';
import type { ResultRecord } from '@/shared/types/assessment';
import AIReportBlock from './AIReportBlock';

const AIReportBlockWrapper: FC<{
  result: ResultRecord;
  resultId: number | null;
  onContinueAssessment?: () => void;
}> = ({ result, resultId }) => {
  return <AIReportBlock result={result} resultId={resultId ?? 0} />;
};

registerResultBlock({
  config: {
    id: 'ai-report',
    name: 'AI 分析报告',
    description: '基于 GPT 的深度性格分析报告',
    icon: 'Sparkles',
    order: 100,
    supportedFamilies: undefined,
    supportedCategories: ['personality', 'psychology', 'cognition', 'ideology', 'career'],
  },
  component: AIReportBlockWrapper as unknown as (props: { result: ResultRecord; resultId: number | null; onContinueAssessment?: () => void }) => React.ReactElement,
});

export { AIReportBlock };
