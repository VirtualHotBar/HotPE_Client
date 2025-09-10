/**
 * 主题管理器 - 统一的主题管理系统
 */

import { THEME_MODES, STORAGE_KEYS, type ThemeMode } from '../constants';

// 主题配置类型
export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor?: string;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
}

// 主题变更事件类型
export interface ThemeChangeEvent {
  oldTheme: ThemeMode;
  newTheme: ThemeMode;
  config: ThemeConfig;
}

/**
 * 主题管理器类
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeMode = THEME_MODES.AUTO;
  private config: ThemeConfig;
  private listeners: Set<(event: ThemeChangeEvent) => void> = new Set();
  private mediaQuery: MediaQueryList;

  private constructor() {
    // 初始化配置
    this.config = {
      mode: THEME_MODES.AUTO,
      primaryColor: '#007bff',
      borderRadius: 6,
      fontSize: 14,
      fontFamily: 'HarmonyOS Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    };

    // 监听系统主题变化
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));

    // 从本地存储加载主题
    this.loadThemeFromStorage();

    // 应用初始主题
    this.applyTheme();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * 获取当前主题模式
   */
  public getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * 获取实际应用的主题（解析auto模式）
   */
  public getActualTheme(): 'light' | 'dark' {
    if (this.currentTheme === THEME_MODES.AUTO) {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return this.currentTheme as 'light' | 'dark';
  }

  /**
   * 获取主题配置
   */
  public getConfig(): ThemeConfig {
    return { ...this.config };
  }

  /**
   * 设置主题模式
   */
  public setTheme(theme: ThemeMode): void {
    const oldTheme = this.currentTheme;

    if (oldTheme === theme) {
      return;
    }

    this.currentTheme = theme;
    this.config.mode = theme;

    // 保存到本地存储
    this.saveThemeToStorage();

    // 应用主题
    this.applyTheme();

    // 触发主题变更事件
    this.notifyThemeChange(oldTheme, theme);
  }

  /**
   * 更新主题配置
   */
  public updateConfig(updates: Partial<Omit<ThemeConfig, 'mode'>>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...updates };

    // 保存到本地存储
    this.saveThemeToStorage();

    // 重新应用主题
    this.applyTheme();

    // 触发配置变更事件
    this.notifyConfigChange(oldConfig, this.config);
  }

  /**
   * 切换主题（在light、dark、auto之间循环）
   */
  public toggleTheme(): void {
    const themes: ThemeMode[] = [THEME_MODES.LIGHT, THEME_MODES.DARK, THEME_MODES.AUTO];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      this.setTheme(nextTheme);
    }
  }

  /**
   * 添加主题变更监听器
   */
  public addThemeChangeListener(listener: (event: ThemeChangeEvent) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除主题变更监听器
   */
  public removeThemeChangeListener(listener: (event: ThemeChangeEvent) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 检查是否为暗色主题
   */
  public isDarkTheme(): boolean {
    return this.getActualTheme() === 'dark';
  }

  /**
   * 检查是否为亮色主题
   */
  public isLightTheme(): boolean {
    return this.getActualTheme() === 'light';
  }

  /**
   * 检查是否为自动主题
   */
  public isAutoTheme(): boolean {
    return this.currentTheme === THEME_MODES.AUTO;
  }

  /**
   * 获取主题相关的CSS类名
   */
  public getThemeClassName(): string {
    const actualTheme = this.getActualTheme();
    return `theme-${actualTheme}`;
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(): void {
    const actualTheme = this.getActualTheme();
    const body = document.body;

    // 移除旧的主题类
    body.classList.remove('theme-light', 'theme-dark');

    // 添加新的主题类
    body.classList.add(`theme-${actualTheme}`);

    // 设置Semi UI主题
    if (actualTheme === 'dark') {
      body.setAttribute('theme-mode', 'dark');
    } else {
      body.removeAttribute('theme-mode');
    }

    // 应用自定义CSS变量
    this.applyCSSVariables();
  }

  /**
   * 应用CSS变量
   */
  private applyCSSVariables(): void {
    const root = document.documentElement;
    const { primaryColor, borderRadius, fontSize, fontFamily } = this.config;

    if (primaryColor) {
      root.style.setProperty('--theme-primary-color', primaryColor);
    }

    if (borderRadius !== undefined) {
      root.style.setProperty('--theme-border-radius', `${borderRadius}px`);
    }

    if (fontSize !== undefined) {
      root.style.setProperty('--theme-font-size', `${fontSize}px`);
    }

    if (fontFamily) {
      root.style.setProperty('--theme-font-family', fontFamily);
    }
  }

  /**
   * 处理系统主题变化
   */
  private handleSystemThemeChange(): void {
    if (this.currentTheme === THEME_MODES.AUTO) {
      // 重新应用主题
      this.applyTheme();

      // 触发主题变更事件
      this.notifyThemeChange(THEME_MODES.AUTO, THEME_MODES.AUTO);
    }
  }

  /**
   * 通知主题变更
   */
  private notifyThemeChange(oldTheme: ThemeMode, newTheme: ThemeMode): void {
    const event: ThemeChangeEvent = {
      oldTheme,
      newTheme,
      config: this.getConfig(),
    };

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('主题变更监听器执行失败:', error);
      }
    });
  }

  /**
   * 通知配置变更
   */
  private notifyConfigChange(oldConfig: ThemeConfig, newConfig: ThemeConfig): void {
    const event: ThemeChangeEvent = {
      oldTheme: oldConfig.mode,
      newTheme: newConfig.mode,
      config: newConfig,
    };

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('主题配置变更监听器执行失败:', error);
      }
    });
  }

  /**
   * 从本地存储加载主题
   */
  private loadThemeFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored) {
        const config: ThemeConfig = JSON.parse(stored);
        this.config = { ...this.config, ...config };
        this.currentTheme = config.mode;
      }
    } catch (error) {
      console.warn('加载主题配置失败:', error);
    }
  }

  /**
   * 保存主题到本地存储
   */
  private saveThemeToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(this.config));
    } catch (error) {
      console.warn('保存主题配置失败:', error);
    }
  }

  /**
   * 重置主题配置
   */
  public resetTheme(): void {
    const defaultConfig: ThemeConfig = {
      mode: THEME_MODES.AUTO,
      primaryColor: '#007bff',
      borderRadius: 6,
      fontSize: 14,
      fontFamily: 'HarmonyOS Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    };

    const oldTheme = this.currentTheme;
    this.config = defaultConfig;
    this.currentTheme = defaultConfig.mode;

    // 保存到本地存储
    this.saveThemeToStorage();

    // 应用主题
    this.applyTheme();

    // 触发主题变更事件
    this.notifyThemeChange(oldTheme, defaultConfig.mode);
  }

  /**
   * 获取主题预设
   */
  public getThemePresets(): Record<string, Partial<ThemeConfig>> {
    return {
      default: {
        primaryColor: '#007bff',
        borderRadius: 6,
      },
      rounded: {
        primaryColor: '#007bff',
        borderRadius: 12,
      },
      compact: {
        fontSize: 12,
        borderRadius: 4,
      },
      comfortable: {
        fontSize: 16,
        borderRadius: 8,
      },
    };
  }

  /**
   * 应用主题预设
   */
  public applyPreset(presetName: string): void {
    const presets = this.getThemePresets();
    const preset = presets[presetName];

    if (preset) {
      this.updateConfig(preset);
    }
  }

  /**
   * 销毁主题管理器
   */
  public destroy(): void {
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
    this.listeners.clear();
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance();

// 便捷函数导出
export const getCurrentTheme = () => themeManager.getCurrentTheme();
export const getActualTheme = () => themeManager.getActualTheme();
export const setTheme = (theme: ThemeMode) => themeManager.setTheme(theme);
export const toggleTheme = () => themeManager.toggleTheme();
export const isDarkTheme = () => themeManager.isDarkTheme();
export const isLightTheme = () => themeManager.isLightTheme();
export const isAutoTheme = () => themeManager.isAutoTheme();
export const addThemeChangeListener = (listener: (event: ThemeChangeEvent) => void) =>
  themeManager.addThemeChangeListener(listener);
export const removeThemeChangeListener = (listener: (event: ThemeChangeEvent) => void) =>
  themeManager.removeThemeChangeListener(listener);
export const updateThemeConfig = (updates: Partial<Omit<ThemeConfig, 'mode'>>) =>
  themeManager.updateConfig(updates);
export const resetTheme = () => themeManager.resetTheme();
export const applyThemePreset = (presetName: string) => themeManager.applyPreset(presetName);
