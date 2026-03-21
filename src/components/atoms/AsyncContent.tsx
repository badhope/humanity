/* eslint-disable react-refresh/only-export-components */
import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, WifiOff } from 'lucide-react';
import { Button } from '@/components/atoms';

export interface AsyncContentState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  retryCount: number;
}

export interface AsyncContentConfig {
  maxRetries?: number;
  retryDelay?: number;
  onErrorRetry?: boolean;
}

const DEFAULT_CONFIG: AsyncContentConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  onErrorRetry: true,
};

export function useAsyncContent<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = [],
  config: AsyncContentConfig = DEFAULT_CONFIG
): AsyncContentState<T> & { retry: () => void; reload: () => void } {
  const [state, setState] = useState<AsyncContentState<T>>({
    loading: true,
    error: null,
    data: null,
    retryCount: 0,
  });

  const execute = useCallback(async (isRetry = false) => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        retryCount: isRetry ? prev.retryCount + 1 : 0,
      }));

      const result = await loader();

      setState({
        loading: false,
        error: null,
        data: result,
        retryCount: 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载失败';
      const currentRetry = isRetry ? state.retryCount + 1 : 1;

      if (config.maxRetries && currentRetry < config.maxRetries && config.onErrorRetry) {
        setTimeout(() => {
          execute(true);
        }, config.retryDelay);
        return;
      }

      setState({
        loading: false,
        error: errorMessage,
        data: null,
        retryCount: currentRetry,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, config.maxRetries, config.retryDelay, config.onErrorRetry, ...deps]);

  useEffect(() => {
    execute();
  }, [execute]);

  const retry = useCallback(() => {
    execute(true);
  }, [execute]);

  const reload = useCallback(() => {
    setState({
      loading: true,
      error: null,
      data: null,
      retryCount: 0,
    });
    execute(false);
  }, [execute]);

  return { ...state, retry, reload };
}

interface LoadingContentProps {
  message?: string;
  showSpinner?: boolean;
}

export const LoadingContent: React.FC<LoadingContentProps> = ({
  message = '加载中...',
  showSpinner = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[200px] flex flex-col items-center justify-center py-12 px-4"
    >
      {showSpinner && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mb-4"
        />
      )}
      <p className="text-gray-500 dark:text-gray-400 text-center">{message}</p>
    </motion.div>
  );
};

interface ErrorContentProps {
  error: string;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  compact?: boolean;
}

export const ErrorContent: React.FC<ErrorContentProps> = ({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  compact = false,
}) => {
  const isNetworkError = error.includes('Failed to fetch') ||
    error.includes('network') ||
    error.includes('Network') ||
    error.includes('网络');

  const canRetry = retryCount < maxRetries;

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
        {onRetry && canRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            重试
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[300px] flex flex-col items-center justify-center py-12 px-4"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full blur-xl opacity-50" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 flex items-center justify-center">
          {isNetworkError ? (
            <WifiOff className="w-10 h-10 text-red-500" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-red-500" />
          )}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {isNetworkError ? '网络连接异常' : '加载失败'}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
        {error}
      </p>

      {retryCount > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          已重试 {retryCount} / {maxRetries} 次
        </p>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          disabled={!canRetry}
        >
          {canRetry ? '重新加载' : '请稍后重试'}
        </Button>
      )}
    </motion.div>
  );
};

interface NetworkStatusProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  children,
  fallback,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center py-12 px-4">
        <WifiOff className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          网络已断开
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          请检查您的网络连接后重试
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

interface SuspenseContentProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
}

export const SuspenseContent: React.FC<SuspenseContentProps> = ({
  children,
  loadingComponent,
}) => {
  return (
    <React.Suspense fallback={loadingComponent || <LoadingContent />}>
      {children}
    </React.Suspense>
  );
};