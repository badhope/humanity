import { CheckCircle } from 'lucide-react';
import { registerQuestionRenderer, type QuestionRendererProps } from './questionRendererPlugin';

export const SingleChoiceRenderer = (props: QuestionRendererProps) => {
  const { question, selectedAnswer, onAnswer, disabled } = props;
  return (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = selectedAnswer === option.value;
        return (
          <button
            key={option.id}
            onClick={() => !disabled && onAnswer(question.id, option.value)}
            disabled={disabled}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 leading-snug">{option.text}</span>
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

registerQuestionRenderer({
  type: 'single-choice',
  name: '单选题',
  description: '标准单选题，每题选择一个选项',
  renderer: SingleChoiceRenderer,
});
