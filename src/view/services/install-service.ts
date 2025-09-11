/**
 * 安全的安装操作服务
 * 替代原有的不安全安装操作，通过IPC调用主进程
 */

/**
 * 安全的PACMD命令执行
 * 已迁移到主进程，防止命令注入风险
 */
export async function runSafePacmd(
  cmd: string, 
  diskIndex?: number,
  callback?: (output: string) => void
): Promise<{ success: boolean; output: string }> {
  try {
    const result = await window.electronAPI.invoke('install:runPacmd', cmd, diskIndex);
    
    // 如果有回调函数，调用它
    if (callback && result.output) {
      callback(result.output);
    }
    
    return result;
  } catch (error) {
    console.error('PACMD命令执行失败:', error);
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 安全的BOOTICE命令执行
 * 已迁移到主进程，防止命令注入风险
 */
export async function runSafeBootice(args: string[]): Promise<{ success: boolean; output: string }> {
  try {
    return await window.electronAPI.invoke('install:runBootice', args);
  } catch (error) {
    console.error('BOOTICE命令执行失败:', error);
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 安全的PECMD命令执行
 * 已迁移到主进程，防止命令注入风险
 */
export async function runSafePecmd(args: string[]): Promise<{ success: boolean; output: string }> {
  try {
    return await window.electronAPI.invoke('install:runPecmd', args);
  } catch (error) {
    console.error('PECMD命令执行失败:', error);
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 安全的FBPLUS命令执行
 * 已迁移到主进程，防止命令注入风险
 */
export async function runSafeFbplus(args: string[]): Promise<{ success: boolean; output: string }> {
  try {
    return await window.electronAPI.invoke('install:runFbplus', args);
  } catch (error) {
    console.error('FBPLUS命令执行失败:', error);
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 安全的OSCDIMG命令执行（ISO生成）
 * 已迁移到主进程，防止命令注入风险
 */
export async function runSafeOscdimg(args: string[]): Promise<{ success: boolean; output: string }> {
  try {
    return await window.electronAPI.invoke('install:runOscdimg', args);
  } catch (error) {
    console.error('OSCDIMG命令执行失败:', error);
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 安全的文件属性设置
 * 已迁移到主进程，防止命令注入风险
 */
export async function setSafeFileAttributes(
  filePath: string, 
  attributes: string
): Promise<{ success: boolean; output: string }> {
  try {
    return await window.electronAPI.invoke('install:setFileAttributes', filePath, attributes);
  } catch (error) {
    console.error('设置文件属性失败:', error);
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 兼容性函数 - 用于逐步迁移现有代码
 */

// 兼容原有的runPacmd调用
export { runSafePacmd as runPacmd };

// 兼容原有的BOOTICE调用
export async function runBooticeCommand(deviceIndex: number, options: string[]): Promise<boolean> {
  const args = [`/DEVICE=${deviceIndex}`, ...options];
  const result = await runSafeBootice(args);
  return result.success;
}

// 兼容原有的PECMD调用
export async function runPecmdCommand(command: string, ...args: string[]): Promise<boolean> {
  const allArgs = [command, ...args];
  const result = await runSafePecmd(allArgs);
  return result.success;
}

// 兼容原有的FBPLUS调用
export async function runFbplusCommand(diskIndex: number, operation: string, ...options: string[]): Promise<boolean> {
  const args = [`(hd${diskIndex})`, operation, ...options];
  const result = await runSafeFbplus(args);
  return result.success;
}

// 兼容原有的文件属性设置
export async function setFileAttributesCompat(filePath: string, attributes: string): Promise<void> {
  const result = await setSafeFileAttributes(filePath, attributes);
  if (!result.success) {
    throw new Error(`设置文件属性失败: ${result.output}`);
  }
}