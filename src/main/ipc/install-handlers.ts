import { ipcMain } from 'electron';
import { safeExecCommand, validateDiskIndex, validateFilePath, generateSafeTempPath, cleanupTempFile } from './security-utils';
import path from 'path';
import { promises as fs } from 'fs';

/**
 * 安全的系统安装处理器
 * 迁移安装相关操作到主进程，防止命令注入和其他安全风险
 */
export function registerInstallHandlers() {
  
  // 安全的PACMD命令执行
  ipcMain.handle('install:runPacmd', async (_, cmd: string, diskIndex?: number) => {
    try {
      // 验证磁盘索引
      if (diskIndex !== undefined) {
        const validatedIndex = validateDiskIndex(diskIndex);
        if (validatedIndex === null) {
          throw new Error('Invalid disk index');
        }
      }

      // 验证和清理命令参数
      const sanitizedCmd = sanitizePacmdCommand(cmd);
      if (!sanitizedCmd) {
        throw new Error('Invalid PACMD command');
      }

      const toolsPath = getToolsPath();
      const pacmdPath = path.join(toolsPath, 'PACMDforUSB', 'PartAssist.exe');
      
      // 生成安全的日志文件路径
      const logPath = generateSafeTempPath('pacmd', '.log');
      
      // 构建安全的命令参数
      const args = [sanitizedCmd, '/out:' + logPath];
      
      console.log(`执行PACMD命令: ${pacmdPath} ${args.join(' ')}`);
      
      await safeExecCommand(pacmdPath, args);
      
      // 读取结果日志
      try {
        const result = await fs.readFile(logPath, 'utf8');
        
        // 清理日志文件
        await cleanupTempFile(logPath);
        
        // 检查操作是否成功
        const success = result.indexOf('完成') !== -1;
        return {
          success,
          output: result
        };
      } catch (readError) {
        console.error('读取PACMD日志失败:', readError);
        await cleanupTempFile(logPath);
        return {
          success: false,
          output: ''
        };
      }
    } catch (error) {
      console.error('PACMD命令执行失败:', error);
      throw new Error(`PACMD命令执行失败: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`);
    }
  });

  // 安全的BOOTICE命令执行
  ipcMain.handle('install:runBootice', async (_, args: string[]) => {
    try {
      // 验证参数
      const sanitizedArgs = args.map(arg => sanitizeBooticeArgument(arg));
      
      const toolsPath = getToolsPath();
      const booticePath = path.join(toolsPath, 'BOOTICE.exe');
      
      console.log(`执行BOOTICE命令: ${booticePath} ${sanitizedArgs.join(' ')}`);
      
      const result = await safeExecCommand(booticePath, sanitizedArgs);
      return {
        success: true,
        output: result.stdout
      };
    } catch (error) {
      console.error('BOOTICE命令执行失败:', error);
      throw new Error(`BOOTICE命令执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // 安全的PECMD命令执行
  ipcMain.handle('install:runPecmd', async (_, args: string[]) => {
    try {
      // 验证参数
      const sanitizedArgs = args.map(arg => sanitizePecmdArgument(arg));
      
      const toolsPath = getToolsPath();
      const pecmdPath = path.join(toolsPath, 'PECMD.exe');
      
      console.log(`执行PECMD命令: ${pecmdPath} ${sanitizedArgs.join(' ')}`);
      
      const result = await safeExecCommand(pecmdPath, sanitizedArgs);
      return {
        success: true,
        output: result.stdout
      };
    } catch (error) {
      console.error('PECMD命令执行失败:', error);
      throw new Error(`PECMD命令执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // 安全的FBPLUS命令执行
  ipcMain.handle('install:runFbplus', async (_, args: string[]) => {
    try {
      // 验证参数
      const sanitizedArgs = args.map(arg => sanitizeFbplusArgument(arg));
      
      const toolsPath = getToolsPath();
      const fbplusPath = path.join(toolsPath, 'fbplus.exe');
      
      console.log(`执行FBPLUS命令: ${fbplusPath} ${sanitizedArgs.join(' ')}`);
      
      const result = await safeExecCommand(fbplusPath, sanitizedArgs);
      return {
        success: true,
        output: result.stdout
      };
    } catch (error) {
      console.error('FBPLUS命令执行失败:', error);
      throw new Error(`FBPLUS命令执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // 安全的OSCDIMG命令执行（ISO生成）
  ipcMain.handle('install:runOscdimg', async (_, args: string[]) => {
    try {
      // 验证参数
      const sanitizedArgs = args.map(arg => sanitizeOscdimgArgument(arg));
      
      const toolsPath = getToolsPath();
      const oscdimgPath = path.join(toolsPath, 'oscdimg', 'oscdimg.exe');
      
      console.log(`执行OSCDIMG命令: ${oscdimgPath} ${sanitizedArgs.join(' ')}`);
      
      const result = await safeExecCommand(oscdimgPath, sanitizedArgs);
      return {
        success: true,
        output: result.stdout
      };
    } catch (error) {
      console.error('OSCDIMG命令执行失败:', error);
      throw new Error(`OSCDIMG命令执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // 安全的文件属性设置
  ipcMain.handle('install:setFileAttributes', async (_, filePath: string, attributes: string) => {
    try {
      // 验证文件路径
      const validatedPath = validateFilePath(filePath);
      if (!validatedPath) {
        throw new Error('Invalid file path');
      }

      // 验证属性参数
      const validAttributes = ['S', 'H', 'R', 'A'];
      const sanitizedAttributes = attributes.split('').filter(attr => 
        validAttributes.includes(attr.toUpperCase())
      ).join('');

      if (!sanitizedAttributes) {
        throw new Error('Invalid attributes');
      }

      const args = [validatedPath, `+${sanitizedAttributes}`, '/S', '/D'];
      
      const result = await safeExecCommand('attrib', args);
      return {
        success: true,
        output: result.stdout
      };
    } catch (error) {
      console.error('设置文件属性失败:', error);
      throw new Error(`设置文件属性失败: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`);
    }
  });
}

/**
 * 获取工具路径
 */
function getToolsPath(): string {
  const appPath = process.cwd();
  return path.join(appPath, 'resources', 'tools');
}

/**
 * PACMD命令参数验证和清理
 */
function sanitizePacmdCommand(cmd: string): string | null {
  if (!cmd || typeof cmd !== 'string') {
    return null;
  }

  // 定义允许的PACMD命令参数
  const allowedCommands = [
    '/hd:', '/setletter:', '/letter:', '/del:', '/init:', '/rebuildmbr:', 
    '/mbrtype:', '/cre', '/size:', '/pri', '/end', '/act', '/hide', 
    '/align', '/fs:', '/label:', '/whide:', '/src:', '/fmt:'
  ];

  // 检查命令是否包含允许的参数
  const hasValidCommand = allowedCommands.some(allowed => 
    cmd.toLowerCase().includes(allowed.toLowerCase())
  );

  if (!hasValidCommand) {
    console.warn(`PACMD命令包含不允许的参数: ${cmd}`);
    return null;
  }

  // 移除潜在的危险字符
  const sanitized = cmd
    .replace(/[;&|`$(){}]/g, '') // 移除命令注入字符
    .replace(/\.\.\//g, '') // 移除路径遍历
    .replace(/\.\.\\/g, ''); // 移除Windows路径遍历

  return sanitized;
}

/**
 * BOOTICE参数验证和清理
 */
function sanitizeBooticeArgument(arg: string): string {
  if (!arg || typeof arg !== 'string') {
    return '';
  }

  // 移除潜在的危险字符
  let sanitized = arg
    .replace(/[;&|`$()]/g, '') // 移除命令注入字符
    .replace(/\.\.\//g, '') // 移除路径遍历
    .replace(/\.\.\\/g, ''); // 移除Windows路径遍历

  return sanitized;
}

/**
 * PECMD参数验证和清理
 */
function sanitizePecmdArgument(arg: string): string {
  if (!arg || typeof arg !== 'string') {
    return '';
  }

  // 移除潜在的危险字符
  let sanitized = arg
    .replace(/[;&|`$()]/g, '') // 移除命令注入字符
    .replace(/\.\.\//g, '') // 移除路径遍历
    .replace(/\.\.\\/g, ''); // 移除Windows路径遍历

  return sanitized;
}

/**
 * FBPLUS参数验证和清理
 */
function sanitizeFbplusArgument(arg: string): string {
  if (!arg || typeof arg !== 'string') {
    return '';
  }

  // 移除潜在的危险字符
  let sanitized = arg
    .replace(/[;&|`$()]/g, '') // 移除命令注入字符
    .replace(/\.\.\//g, '') // 移除路径遍历
    .replace(/\.\.\\/g, ''); // 移除Windows路径遍历

  return sanitized;
}

/**
 * OSCDIMG参数验证和清理
 */
function sanitizeOscdimgArgument(arg: string): string {
  if (!arg || typeof arg !== 'string') {
    return '';
  }

  // 移除潜在的危险字符
  let sanitized = arg
    .replace(/[;&|`$()]/g, '') // 移除命令注入字符
    .replace(/\.\.\//g, '') // 移除路径遍历
    .replace(/\.\.\\/g, ''); // 移除Windows路径遍历

  return sanitized;
}