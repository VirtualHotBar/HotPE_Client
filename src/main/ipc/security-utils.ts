import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { promises as fs } from 'fs';

const execAsync = promisify(exec);

/**
 * 安全工具函数库
 * 用于防止命令注入、路径遍历等安全风险
 */

/**
 * 安全的命令执行函数
 * 使用参数化执行，防止命令注入
 */
export async function safeExecCommand(
  command: string,
  args: string[] = [],
  options: {
    cwd?: string;
    timeout?: number;
    encoding?: BufferEncoding;
  } = {}
): Promise<{ stdout: string; stderr: string }> {
  try {
    // 验证命令路径
    const sanitizedCommand = sanitizeCommandPath(command);
    if (!sanitizedCommand) {
      throw new Error('Invalid command path');
    }

    // 验证参数
    const sanitizedArgs = args.map(arg => sanitizeCommandArgument(arg));
    
    // 构建完整命令
    const fullCommand = `"${sanitizedCommand}" ${sanitizedArgs.join(' ')}`;
    
    console.log(`执行安全命令: ${fullCommand}`);
    
    const result = await execAsync(fullCommand, {
      cwd: options.cwd,
      timeout: options.timeout || 30000, // 默认30秒超时
      encoding: options.encoding || 'utf8'
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr
    };
  } catch (error) {
    console.error('命令执行失败:', error);
    throw new Error(`命令执行失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 安全的流式命令执行
 * 支持实时输出监听
 */
export function safeSpawnCommand(
  command: string,
  args: string[] = [],
  options: {
    cwd?: string;
    onStdout?: (data: string) => void;
    onStderr?: (data: string) => void;
    onClose?: (code: number) => void;
  } = {}
): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      // 验证命令路径
      const sanitizedCommand = sanitizeCommandPath(command);
      if (!sanitizedCommand) {
        reject(new Error('Invalid command path'));
        return;
      }

      // 验证参数
      const sanitizedArgs = args.map(arg => sanitizeCommandArgument(arg));
      
      console.log(`执行流式命令: ${sanitizedCommand} ${sanitizedArgs.join(' ')}`);
      
      const child = spawn(sanitizedCommand, sanitizedArgs, {
        cwd: options.cwd,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.stdout?.on('data', (data) => {
        const output = data.toString();
        options.onStdout?.(output);
      });

      child.stderr?.on('data', (data) => {
        const output = data.toString();
        options.onStderr?.(output);
      });

      child.on('close', (code) => {
        options.onClose?.(code || 0);
        resolve(code || 0);
      });

      child.on('error', (error) => {
        console.error('流式命令执行失败:', error);
        reject(new Error(`流式命令执行失败: ${error.message}`));
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 命令路径验证和清理
 */
function sanitizeCommandPath(commandPath: string): string | null {
  if (!commandPath || typeof commandPath !== 'string') {
    return null;
  }

  // 解析路径
  const resolvedPath = path.resolve(commandPath);
  
  // 检查路径是否在允许的目录内
  const allowedDirs = [
    path.resolve(process.cwd(), 'resources', 'tools'),
    path.resolve(process.env['WINDIR'] || 'C:\\Windows', 'System32'),
    path.resolve(process.env['PROGRAMFILES'] || 'C:\\Program Files'),
    path.resolve(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)')
  ];

  const isAllowed = allowedDirs.some(dir => resolvedPath.startsWith(dir));
  if (!isAllowed) {
    console.warn(`命令路径不在允许范围内: ${resolvedPath}`);
    return null;
  }

  return resolvedPath;
}

/**
 * 命令参数验证和清理
 */
function sanitizeCommandArgument(arg: string): string {
  if (!arg || typeof arg !== 'string') {
    return '';
  }

  // 移除潜在的危险字符
  let sanitized = arg
    .replace(/[;&|`$()]/g, '') // 移除命令注入字符
    .replace(/\.\.\//g, '') // 移除路径遍历
    .replace(/\.\.\\/g, ''); // 移除Windows路径遍历

  // 如果参数包含空格，用引号包围
  if (sanitized.includes(' ')) {
    sanitized = `"${sanitized}"`;
  }

  return sanitized;
}

/**
 * 安全的文件路径验证
 */
export function validateFilePath(filePath: string, allowedBasePaths: string[] = []): string | null {
  if (!filePath || typeof filePath !== 'string') {
    return null;
  }

  try {
    // 解析路径
    const resolvedPath = path.resolve(filePath);
    
    // 默认允许的基础路径
    const defaultAllowedPaths = [
      path.resolve(process.cwd()),
      path.resolve(process.env['TEMP'] || process.env['TMP'] || '/tmp'),
      path.resolve(process.env['USERPROFILE'] || process.env['HOME'] || '/')
    ];

    const allAllowedPaths = [...defaultAllowedPaths, ...allowedBasePaths];
    
    // 检查路径是否在允许的目录内
    const isAllowed = allAllowedPaths.some(basePath => 
      resolvedPath.startsWith(basePath)
    );

    if (!isAllowed) {
      console.warn(`文件路径不在允许范围内: ${resolvedPath}`);
      return null;
    }

    return resolvedPath;
  } catch (error) {
    console.error('路径验证失败:', error);
    return null;
  }
}

/**
 * 安全的JSON解析
 */
export function safeJSONParse(content: string): any {
  try {
    // 清理BOM和空白字符
    const cleanContent = content.replace(/^\uFEFF/, '').trim();
    
    if (!cleanContent) {
      return {};
    }

    // 基本的内容验证
    if (cleanContent.length > 10 * 1024 * 1024) { // 10MB限制
      throw new Error('JSON内容过大');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('JSON解析失败:', error);
    throw new Error(`JSON解析失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 生成安全的临时文件路径
 */
export function generateSafeTempPath(prefix: string = 'temp', extension: string = '.tmp'): string {
  const tempDir = process.env['TEMP'] || process.env['TMP'] || '/tmp';
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  
  return path.join(tempDir, `${prefix}_${timestamp}_${randomSuffix}${extension}`);
}

/**
 * 清理临时文件
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log(`临时文件已清理: ${filePath}`);
  } catch (error) {
    console.warn(`清理临时文件失败: ${filePath}`, error);
  }
}

/**
 * 参数白名单验证
 */
export function validateParameterWhitelist(
  parameter: string,
  whitelist: string[]
): boolean {
  if (!parameter || typeof parameter !== 'string') {
    return false;
  }

  return whitelist.some(allowed => 
    parameter.toLowerCase().includes(allowed.toLowerCase())
  );
}

/**
 * 磁盘索引验证
 */
export function validateDiskIndex(diskIndex: string | number): number | null {
  const index = typeof diskIndex === 'string' ? parseInt(diskIndex, 10) : diskIndex;
  
  if (isNaN(index) || index < 0 || index > 99) {
    return null;
  }
  
  return index;
}

/**
 * 盘符验证
 */
export function validateDriveLetter(letter: string): string | null {
  if (!letter || typeof letter !== 'string') {
    return null;
  }

  const cleaned = letter.toUpperCase().replace(/[^A-Z:]/g, '');
  const match = cleaned.match(/^([A-Z]):?$/);
  
  if (!match) {
    return null;
  }

  return `${match[1]}:`;
}