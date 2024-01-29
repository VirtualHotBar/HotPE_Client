import { config } from "../../services/config";

// 设置颜色模式的函数
export function setThemeMode(mode: 'dark' | 'light' | 'auto'): void {
  const body = document.body;
  let isDarkMode: boolean;

  switch (mode) {
    case 'dark':
      isDarkMode = true;
      break;
    case 'light':
      isDarkMode = false;
      break;
    case 'auto':
      isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      break;
  }
  
  // 根据模式设置页面主题和背景颜色
  if (isDarkMode) {
    body.setAttribute('theme-mode', 'dark');
    body.style.backgroundColor = "#2E2E2E";
  } else {
    body.setAttribute('theme-mode', 'light');
    body.style.backgroundColor = "#FFFFFF";
  }
}

// 使用函数时直接传入符合类型别名定义的字符串
setThemeMode(config.setting.client.themeMode); // 只能传入 'dark', 'light' 或 'auto'

// 监听系统颜色模式的改变并更新主题
const mql = window.matchMedia('(prefers-color-scheme: dark)');
mql.addListener(() => setThemeMode('auto'));