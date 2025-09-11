/**
 * 安全的硬件信息获取函数
 * 已迁移到主进程，修复eval()安全风险
 */
export async function getHardwareInfo(parameter: string): Promise<any> {
  try {
    // 参数验证
    if (!parameter || typeof parameter !== 'string') {
      throw new Error('Invalid parameter');
    }

    // 通过IPC调用主进程的安全处理器
    const result = await window.electronAPI.invoke('hardware:getInfo', parameter);
    return result;
  } catch (error) {
    console.error('获取硬件信息失败:', error);
    // 返回空对象作为fallback
    return {};
  }
}
