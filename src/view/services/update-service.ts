/**
 * 更新管理前端服务
 * 提供安全的更新操作接口
 */

// 更新信息接口
interface UpdateInfo {
  id: number;
  version: string;
  fileName: string;
  downloadUrl: string;
  description: string;
  size: number;
}

/**
 * 安全获取更新信息
 */
export async function fetchUpdateInfoSafe(apiUrl: string): Promise<{ pe: UpdateInfo; client: UpdateInfo } | null> {
  try {
    const result = await window.electronAPI.invoke('update:fetchInfo', apiUrl);
    return result;
  } catch (error) {
    console.error('获取更新信息失败:', error);
    return null;
  }
}

/**
 * 安全复制更新文件
 */
export async function copyUpdateFilesSafe(toolsPath: string, clientPath: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('update:copyFiles', toolsPath, clientPath);
    return result;
  } catch (error) {
    console.error('复制更新文件失败:', error);
    return false;
  }
}

/**
 * 安全创建更新批处理文件
 */
export async function createUpdateBatchSafe(
  toolsPath: string,
  clientPath: string,
  packPath: string,
  execDir: string
): Promise<string | null> {
  try {
    const result = await window.electronAPI.invoke('update:createBatch', toolsPath, clientPath, packPath, execDir);
    return result;
  } catch (error) {
    console.error('创建更新批处理文件失败:', error);
    return null;
  }
}

/**
 * 安全执行更新重启
 */
export async function executeUpdateRestartSafe(batPath: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('update:executeRestart', batPath);
    return result;
  } catch (error) {
    console.error('执行更新重启失败:', error);
    return false;
  }
}

/**
 * 检查更新标记文件
 */
export async function checkUpdateMarkSafe(markFilePath: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('update:checkMark', markFilePath);
    return result;
  } catch (error) {
    console.error('检查更新标记文件失败:', error);
    return false;
  }
}

/**
 * 删除更新标记文件
 */
export async function removeUpdateMarkSafe(markFilePath: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('update:removeMark', markFilePath);
    return result;
  } catch (error) {
    console.error('删除更新标记文件失败:', error);
    return false;
  }
}

/**
 * 检查更新（兼容原有接口）
 */
export async function checkUpdateSafe(apiUrl: string, currentPEVersion: string, currentClientId: number): Promise<{
  resUpdate: 'needUpdatePE' | 'needUpdateClient' | 'without';
  peUpdate?: UpdateInfo;
  clientUpdate?: UpdateInfo;
}> {
  try {
    const updateInfo = await fetchUpdateInfoSafe(apiUrl);
    
    if (!updateInfo) {
      return { resUpdate: 'without' };
    }

    // 检查PE更新
    const currentPEId = parseInt(currentPEVersion.split('.')[0] || '0');
    if (currentPEId < updateInfo.pe.id) {
      return {
        resUpdate: 'needUpdatePE',
        peUpdate: updateInfo.pe,
        clientUpdate: updateInfo.client
      };
    }

    // 检查客户端更新
    if (currentClientId < updateInfo.client.id) {
      return {
        resUpdate: 'needUpdateClient',
        peUpdate: updateInfo.pe,
        clientUpdate: updateInfo.client
      };
    }

    return {
      resUpdate: 'without',
      peUpdate: updateInfo.pe,
      clientUpdate: updateInfo.client
    };
  } catch (error) {
    console.error('检查更新失败:', error);
    return { resUpdate: 'without' };
  }
}

/**
 * 更新完成后提示（兼容原有接口）
 */
export async function updateDoneTipSafe(execDir: string): Promise<boolean> {
  try {
    const markFile = `${execDir}update.mark`;
    const markExists = await checkUpdateMarkSafe(markFile);
    
    if (markExists) {
      const removed = await removeUpdateMarkSafe(markFile);
      return removed;
    }
    
    return false;
  } catch (error) {
    console.error('更新完成提示处理失败:', error);
    return false;
  }
}