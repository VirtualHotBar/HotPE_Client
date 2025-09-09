/**
 * 错误边界组件 - 捕获和处理React组件错误
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Typography, Space } from '@douyinfe/semi-ui';
import { IconRefresh } from '@douyinfe/semi-icons';
import { IconAlertTriangle } from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 可以在这里添加错误上报逻辑
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // 错误上报逻辑
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // 这里可以发送到错误监控服务
    console.log('Error Report:', errorReport);
  };

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconAlertTriangle size="extra-large" style={{ color: 'var(--semi-color-danger)', marginBottom: '16px' }} />
          
          <Title heading={3} style={{ marginBottom: '8px' }}>
            应用出现错误
          </Title>
          
          <Text type="secondary" style={{ marginBottom: '24px', maxWidth: '500px' }}>
            很抱歉，应用遇到了一个意外错误。您可以尝试重新加载页面或重启应用。
          </Text>

          {process.env['NODE_ENV'] === 'development' && this.state.error && (
            <details style={{ marginBottom: '24px', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                <Text strong>错误详情 (开发模式)</Text>
              </summary>
              <pre
                style={{
                  background: 'var(--semi-color-fill-0)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}

          <Space>
            <Button
              icon={<IconRefresh />}
              onClick={this.handleRetry}
              type="primary"
            >
              重试
            </Button>
            <Button onClick={this.handleReload}>
              重新加载
            </Button>
          </Space>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;