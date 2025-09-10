/**
 * 性能监控器 - 应用性能监控和分析工具
 */

// 性能指标类型
export interface PerformanceMetrics {
  // 内存使用情况
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  // CPU使用情况
  cpu: {
    usage: number;
    cores: number;
  };
  // 渲染性能
  rendering: {
    fps: number;
    frameTime: number;
    droppedFrames: number;
  };
  // 网络性能
  network: {
    latency: number;
    bandwidth: number;
  };
  // 应用启动时间
  startup: {
    total: number;
    main: number;
    renderer: number;
  };
}

// 性能事件类型
export interface PerformanceEvent {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

// 性能警告类型
export interface PerformanceWarning {
  type: 'memory' | 'cpu' | 'fps' | 'latency';
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isMonitoring = false;
  private metrics: PerformanceMetrics;
  private events: PerformanceEvent[] = [];
  private warnings: PerformanceWarning[] = [];
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private warningListeners: Set<(warning: PerformanceWarning) => void> = new Set();
  private monitoringInterval: NodeJS.Timeout | undefined;
  private frameCounter = 0;
  private lastFrameTime = 0;
  private droppedFrames = 0;

  // 性能阈值配置
  private thresholds = {
    memory: { low: 70, medium: 80, high: 90, critical: 95 },
    cpu: { low: 60, medium: 70, high: 85, critical: 95 },
    fps: { low: 45, medium: 30, high: 20, critical: 10 },
    latency: { low: 100, medium: 200, high: 500, critical: 1000 },
  };

  private constructor() {
    this.metrics = this.getInitialMetrics();
    this.setupFrameMonitoring();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始监控
   */
  public startMonitoring(interval = 1000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log('性能监控已启动');

    // 定期收集性能指标
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, interval);

    // 立即收集一次指标
    this.collectMetrics();
  }

  /**
   * 停止监控
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('性能监控已停止');
  }

  /**
   * 获取当前性能指标
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取性能事件历史
   */
  public getEvents(): PerformanceEvent[] {
    return [...this.events];
  }

  /**
   * 获取性能警告
   */
  public getWarnings(): PerformanceWarning[] {
    return [...this.warnings];
  }

  /**
   * 清除性能警告
   */
  public clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * 记录性能事件
   */
  public recordEvent(name: string, metadata?: Record<string, unknown>): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const event: PerformanceEvent = {
        name,
        startTime,
        endTime,
        duration,
        ...(metadata && { metadata }),
      };

      this.events.push(event);

      // 限制事件历史大小
      if (this.events.length > 1000) {
        this.events = this.events.slice(-500);
      }

      console.log(`性能事件: ${name} 耗时 ${duration.toFixed(2)}ms`);
    };
  }

  /**
   * 测量函数执行时间
   */
  public async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const endEvent = this.recordEvent(name, metadata);

    try {
      const result = await fn();
      endEvent();
      return result;
    } catch (error) {
      endEvent();
      throw error;
    }
  }

  /**
   * 测量同步函数执行时间
   */
  public measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    const endEvent = this.recordEvent(name, metadata);

    try {
      const result = fn();
      endEvent();
      return result;
    } catch (error) {
      endEvent();
      throw error;
    }
  }

  /**
   * 添加性能指标监听器
   */
  public addMetricsListener(listener: (metrics: PerformanceMetrics) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除性能指标监听器
   */
  public removeMetricsListener(listener: (metrics: PerformanceMetrics) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 添加性能警告监听器
   */
  public addWarningListener(listener: (warning: PerformanceWarning) => void): void {
    this.warningListeners.add(listener);
  }

  /**
   * 移除性能警告监听器
   */
  public removeWarningListener(listener: (warning: PerformanceWarning) => void): void {
    this.warningListeners.delete(listener);
  }

  /**
   * 获取性能报告
   */
  public getPerformanceReport(): {
    summary: PerformanceMetrics;
    events: PerformanceEvent[];
    warnings: PerformanceWarning[];
    statistics: {
      averageEventDuration: number;
      slowestEvents: PerformanceEvent[];
      warningCount: Record<string, number>;
    };
  } {
    const events = this.getEvents();
    const warnings = this.getWarnings();

    // 计算统计信息
    const averageEventDuration =
      events.length > 0
        ? events.reduce((sum, event) => sum + event.duration, 0) / events.length
        : 0;

    const slowestEvents = events.sort((a, b) => b.duration - a.duration).slice(0, 10);

    const warningCount = warnings.reduce(
      (count, warning) => {
        count[warning.type] = (count[warning.type] || 0) + 1;
        return count;
      },
      {} as Record<string, number>
    );

    return {
      summary: this.getMetrics(),
      events,
      warnings,
      statistics: {
        averageEventDuration,
        slowestEvents,
        warningCount,
      },
    };
  }

  /**
   * 导出性能数据
   */
  public exportData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * 收集性能指标
   */
  private async collectMetrics(): Promise<void> {
    try {
      // 收集内存信息
      const memoryInfo = await this.getMemoryInfo();

      // 收集CPU信息
      const cpuInfo = await this.getCPUInfo();

      // 更新指标
      this.metrics = {
        ...this.metrics,
        memory: memoryInfo,
        cpu: cpuInfo,
        rendering: {
          fps: this.calculateFPS(),
          frameTime: this.lastFrameTime,
          droppedFrames: this.droppedFrames,
        },
      };

      // 检查性能警告
      this.checkPerformanceWarnings();

      // 通知监听器
      this.notifyMetricsListeners();
    } catch (error) {
      console.error('收集性能指标失败:', error);
    }
  }

  /**
   * 获取内存信息
   */
  private async getMemoryInfo(): Promise<PerformanceMetrics['memory']> {
    try {
      // 尝试使用 performance.memory (Chrome)
      if ('memory' in performance) {
        const memory = (
          performance as {
            memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
          }
        ).memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const percentage = (used / total) * 100;

        return { used, total, percentage };
      }

      // 回退到估算
      return {
        used: 0,
        total: 0,
        percentage: 0,
      };
    } catch (error) {
      return {
        used: 0,
        total: 0,
        percentage: 0,
      };
    }
  }

  /**
   * 获取CPU信息
   */
  private async getCPUInfo(): Promise<PerformanceMetrics['cpu']> {
    try {
      // 获取CPU核心数
      const cores = navigator.hardwareConcurrency || 4;

      // CPU使用率需要通过主进程获取
      const usage = 0; // 这里可以通过IPC从主进程获取实际CPU使用率

      return { usage, cores };
    } catch (error) {
      return { usage: 0, cores: 4 };
    }
  }

  /**
   * 计算FPS
   */
  private calculateFPS(): number {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;

    if (deltaTime > 0) {
      return Math.round(1000 / deltaTime);
    }

    return 60; // 默认值
  }

  /**
   * 设置帧监控
   */
  private setupFrameMonitoring(): void {
    const frameCallback = (timestamp: number) => {
      this.frameCounter++;

      if (this.lastFrameTime > 0) {
        const deltaTime = timestamp - this.lastFrameTime;

        // 检测掉帧（超过16.67ms表示低于60fps）
        if (deltaTime > 16.67) {
          this.droppedFrames++;
        }
      }

      this.lastFrameTime = timestamp;
      requestAnimationFrame(frameCallback);
    };

    requestAnimationFrame(frameCallback);
  }

  /**
   * 检查性能警告
   */
  private checkPerformanceWarnings(): void {
    const { memory, cpu, rendering } = this.metrics;

    // 检查内存使用率
    this.checkThreshold('memory', memory.percentage, this.thresholds.memory, '内存使用率');

    // 检查CPU使用率
    this.checkThreshold('cpu', cpu.usage, this.thresholds.cpu, 'CPU使用率');

    // 检查FPS
    this.checkThreshold('fps', rendering.fps, this.thresholds.fps, 'FPS', true);
  }

  /**
   * 检查阈值
   */
  private checkThreshold(
    type: keyof typeof this.thresholds,
    value: number,
    thresholds: typeof this.thresholds.memory,
    name: string,
    reverse = false
  ): void {
    let level: PerformanceWarning['level'] | null = null;
    let threshold = 0;

    if (reverse) {
      // 对于FPS，值越低越严重
      if (value <= thresholds.critical) {
        level = 'critical';
        threshold = thresholds.critical;
      } else if (value <= thresholds.high) {
        level = 'high';
        threshold = thresholds.high;
      } else if (value <= thresholds.medium) {
        level = 'medium';
        threshold = thresholds.medium;
      } else if (value <= thresholds.low) {
        level = 'low';
        threshold = thresholds.low;
      }
    } else {
      // 对于内存、CPU，值越高越严重
      if (value >= thresholds.critical) {
        level = 'critical';
        threshold = thresholds.critical;
      } else if (value >= thresholds.high) {
        level = 'high';
        threshold = thresholds.high;
      } else if (value >= thresholds.medium) {
        level = 'medium';
        threshold = thresholds.medium;
      } else if (value >= thresholds.low) {
        level = 'low';
        threshold = thresholds.low;
      }
    }

    if (level) {
      const warning: PerformanceWarning = {
        type,
        level,
        message: `${name}${reverse ? '过低' : '过高'}: ${value.toFixed(1)}${type === 'fps' ? '' : '%'}`,
        value,
        threshold,
        timestamp: new Date(),
      };

      this.addWarning(warning);
    }
  }

  /**
   * 添加性能警告
   */
  private addWarning(warning: PerformanceWarning): void {
    // 避免重复警告（5秒内同类型警告只记录一次）
    const recentWarning = this.warnings.find(
      w =>
        w.type === warning.type &&
        w.level === warning.level &&
        Date.now() - w.timestamp.getTime() < 5000
    );

    if (!recentWarning) {
      this.warnings.push(warning);

      // 限制警告历史大小
      if (this.warnings.length > 100) {
        this.warnings = this.warnings.slice(-50);
      }

      // 通知警告监听器
      this.notifyWarningListeners(warning);
    }
  }

  /**
   * 通知指标监听器
   */
  private notifyMetricsListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.metrics);
      } catch (error) {
        console.error('性能指标监听器执行失败:', error);
      }
    });
  }

  /**
   * 通知警告监听器
   */
  private notifyWarningListeners(warning: PerformanceWarning): void {
    this.warningListeners.forEach(listener => {
      try {
        listener(warning);
      } catch (error) {
        console.error('性能警告监听器执行失败:', error);
      }
    });
  }

  /**
   * 获取初始指标
   */
  private getInitialMetrics(): PerformanceMetrics {
    return {
      memory: { used: 0, total: 0, percentage: 0 },
      cpu: { usage: 0, cores: navigator.hardwareConcurrency || 4 },
      rendering: { fps: 60, frameTime: 16.67, droppedFrames: 0 },
      network: { latency: 0, bandwidth: 0 },
      startup: { total: 0, main: 0, renderer: 0 },
    };
  }

  /**
   * 销毁监控器
   */
  public destroy(): void {
    this.stopMonitoring();
    this.listeners.clear();
    this.warningListeners.clear();
    this.events = [];
    this.warnings = [];
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 便捷函数导出
export const startPerformanceMonitoring = (interval?: number) =>
  performanceMonitor.startMonitoring(interval);

export const stopPerformanceMonitoring = () => performanceMonitor.stopMonitoring();

export const recordPerformanceEvent = (name: string, metadata?: Record<string, unknown>) =>
  performanceMonitor.recordEvent(name, metadata);

export const measurePerformance = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, unknown>
) => performanceMonitor.measure(name, fn, metadata);

export const measureAsyncPerformance = <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
) => performanceMonitor.measureAsync(name, fn, metadata);

export const getPerformanceMetrics = () => performanceMonitor.getMetrics();

export const getPerformanceReport = () => performanceMonitor.getPerformanceReport();

export const exportPerformanceData = () => performanceMonitor.exportData();
