/**
 * 全局状态管理 - 使用 React Context + useReducer
 */

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { Config } from '../type/config';

// 状态类型定义
export interface AppState {
  // 应用状态
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 导航状态
  currentPage: string;
  isMenuLocked: boolean;

  // 配置状态
  config: Config | null;

  // UI状态
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
}

// 动作类型定义
export type AppAction =
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_PAGE'; payload: string }
  | { type: 'SET_MENU_LOCKED'; payload: boolean }
  | { type: 'SET_CONFIG'; payload: Config }
  | { type: 'UPDATE_CONFIG'; payload: Partial<Config> }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'RESET_STATE' };

// 初始状态
const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  currentPage: 'Home',
  isMenuLocked: false,
  config: null,
  theme: 'auto',
  sidebarCollapsed: false,
};

// Reducer 函数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_MENU_LOCKED':
      return { ...state, isMenuLocked: action.payload };

    case 'SET_CONFIG':
      return { ...state, config: action.payload };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: state.config ? { ...state.config, ...action.payload } : null,
      };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context 类型定义
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 便捷方法
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: string) => void;
  setMenuLocked: (locked: boolean) => void;
  setConfig: (config: Config) => void;
  updateConfig: (config: Partial<Config>) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  resetState: () => void;
}

// 创建 Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider 组件
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 便捷方法
  const setInitialized = useCallback((initialized: boolean) => {
    dispatch({ type: 'SET_INITIALIZED', payload: initialized });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setCurrentPage = useCallback((page: string) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  const setMenuLocked = useCallback((locked: boolean) => {
    dispatch({ type: 'SET_MENU_LOCKED', payload: locked });
  }, []);

  const setConfig = useCallback((config: Config) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
  }, []);

  const updateConfig = useCallback((config: Partial<Config>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    setInitialized,
    setLoading,
    setError,
    setCurrentPage,
    setMenuLocked,
    setConfig,
    updateConfig,
    setTheme,
    toggleSidebar,
    resetState,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// Hook 用于使用 Context
export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}

// 选择器 Hook - 用于性能优化
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const { state } = useAppStore();
  return selector(state);
}

// 常用选择器
export const selectors = {
  isInitialized: (state: AppState) => state.isInitialized,
  isLoading: (state: AppState) => state.isLoading,
  error: (state: AppState) => state.error,
  currentPage: (state: AppState) => state.currentPage,
  isMenuLocked: (state: AppState) => state.isMenuLocked,
  config: (state: AppState) => state.config,
  theme: (state: AppState) => state.theme,
  sidebarCollapsed: (state: AppState) => state.sidebarCollapsed,
};
