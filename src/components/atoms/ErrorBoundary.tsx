import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/atoms';
import { RefreshCw, AlertTriangle, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  chunkLoadFailed: boolean;
}

class ErrorBoundary extends Component<Props, Omit<State, 'errorInfo'>> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      chunkLoadFailed: false,
    };
  }

  static getDerivedStateFromError(error: Error): Omit<State, 'errorInfo'> {
    const chunkLoadFailed = error.message.includes('Failed to fetch') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('chunk') ||
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading CSS chunk');

    return {
      hasError: true,
      error,
      chunkLoadFailed,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      chunkLoadFailed: false,
    });
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.hash = '#/';
    window.location.reload();
  };

  handleGoBack = (): void => {
    window.history.back();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, chunkLoadFailed } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 animate-pulse" />
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {chunkLoadFailed ? '资源加载失败' : '页面出现错误'}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {chunkLoadFailed
                  ? '部分资源未能成功加载，这可能与网络连接有关。'
                  : '抱歉，页面在加载过程中遇到了问题。'}
              </p>

              {error && (
                <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                  <summary className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
                    错误详情
                  </summary>
                  <pre className="mt-2 text-xs text-red-500 dark:text-red-400 overflow-auto max-h-32">
                    {error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                className="w-full"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                重新加载页面
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={this.handleGoBack}
                  variant="ghost"
                  className="flex-1"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  返回上一页
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="flex-1"
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  回到首页
                </Button>
              </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
              如果问题持续存在，请检查您的网络连接或稍后再试。
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;