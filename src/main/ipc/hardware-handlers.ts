import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 安全的硬件信息获取处理器
 * 修复原有的eval()安全风险
 */
export function registerHardwareHandlers() {
  // 获取硬件信息
  ipcMain.handle('hardware:getInfo', async (_, parameter: string) => {
    try {
      // 参数验证和清理
      const sanitizedParameter = sanitizeParameter(parameter);
      if (!sanitizedParameter) {
        throw new Error('Invalid parameter');
      }

      // 生成安全的临时文件路径
      const tempDir = process.env['TEMP'] || process.env['TMP'] || '/tmp';
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const outPath = path.join(tempDir, `hwinfo_${randomSuffix}.json`);

      // 构建安全的命令
      const toolsPath = getToolsPath();
      const nwinfoPath = path.join(toolsPath, 'nwinfo', 'nwinfo.exe');
      
      // 验证工具路径存在
      await fs.access(nwinfoPath);

      // 使用参数化命令执行，避免命令注入
      const command = `"${nwinfoPath}" ${sanitizedParameter} --format=json --output="${outPath}"`;
      
      console.log(`执行硬件信息获取命令: ${command}`);
      await execAsync(command);

      let hwinfo = '{}';
      
      try {
        // 检查文件是否存在
        await fs.access(outPath);
        const fileContent = await fs.readFile(outPath, 'utf8');
        
        // 安全的JSON解析，替代eval()
        hwinfo = validateAndParseJSON(fileContent);
        
        // 清理临时文件
        await fs.unlink(outPath).catch(() => {
          // 忽略删除失败的错误
        });
      } catch (error) {
        console.warn('读取硬件信息文件失败:', error);
        // 确保清理临时文件
        await fs.unlink(outPath).catch(() => {});
      }

      return hwinfo;
    } catch (error) {
      console.error('获取硬件信息失败:', error);
      throw new Error(`获取硬件信息失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

/**
 * 参数验证和清理
 */
function sanitizeParameter(parameter: string): string | null {
  if (!parameter || typeof parameter !== 'string') {
    return null;
  }

  // 移除潜在的危险字符
  const sanitized = parameter
    .replace(/[;&|`$(){}[\]]/g, '') // 移除命令注入字符
    .replace(/\.\./g, '') // 移除路径遍历
    .trim();

  // 验证参数格式（根据nwinfo工具的实际参数格式调整）
  const validParameterPattern = /^[a-zA-Z0-9\-_\s]+$/;
  if (!validParameterPattern.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * 安全的JSON解析和验证
 */
function validateAndParseJSON(content: string): any {
  try {
    // 清理可能的BOM和多余空白字符
    const cleanContent = content.replace(/^\uFEFF/, '').trim();
    
    if (!cleanContent) {
      return {};
    }

    // 使用JSON.parse替代eval()
    const parsed = JSON.parse(cleanContent);
    
    // 基本的数据验证
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('解析的硬件信息不是有效对象');
      return {};
    }

    return parsed;
  } catch (error) {
    console.error('JSON解析失败:', error);
    console.error('原始内容:', content.substring(0, 200) + '...');
    
    // 尝试修复常见的JSON格式问题
    try {
      const fixedContent = fixCommonJSONIssues(content);
      return JSON.parse(fixedContent);
    } catch (fixError) {
      console.error('JSON修复也失败:', fixError);
      return {};
    }
  }
}

/**
 * 修复常见的JSON格式问题
 */
function fixCommonJSONIssues(content: string): string {
  let fixed = content
    .replace(/^\uFEFF/, '') // 移除BOM
    .trim()
    .replace(/,\s*}/g, '}') // 移除对象末尾多余的逗号
    .replace(/,\s*]/g, ']') // 移除数组末尾多余的逗号
    .replace(/'/g, '"') // 将单引号替换为双引号
    .replace(/(\w+):/g, '"$1":'); // 为属性名添加引号

  return fixed;
}

/**
 * 获取工具路径
 */
function getToolsPath(): string {
  // 这里需要根据实际的配置获取工具路径
  // 暂时使用相对路径，实际使用时应该从配置中获取
  const appPath = process.cwd();
  return path.join(appPath, 'resources', 'tools');
}