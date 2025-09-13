/**
 * HPM (HotPE Package Manager) 统一服务
 * 整合所有 HPM 相关功能，提供统一的 API 接口
 */

import { HPM, HPMClass, HPMDl } from '../../types/hpm';
import { config } from './config';
import { logger } from './logger';
import { eventBus } from './event-bus';
import { Toast } from '@douyinfe/semi-ui';
import { startDownloadSafe, stopDownloadSafe } from './aria2-service';
import { Aria2Status } from '@/types/aria2';

// HPM 状态接口
interface HPMState {
  localModules: {
    enabled: HPM[];
    disabled: HPM[];
  };
  onlineModules: HPMClass[];
  downloadTasks: HPMDl[];
  isReady: boolean;
  isLoading: boolean;
}

/**
 * HPM 服务类
 */
class HPMService {
  private state: HPMState = {
    localModules: { enabled: [], disabled: [] },
    onlineModules: [],
    downloadTasks: [],
    isReady: false,
    isLoading: false,
  };

  private isCheckingFiles = false;

  // 渲染回调接口
  public render = {
    callRefreshPage: () => {},
    callRefreshNav: () => {},
    callRefreshResult: () => {},
    callRefreshDlTab: [] as Function[],
  };

  constructor() {
    this.initialize();
  }

  /**
   * 初始化服务
   */
  private async initialize(): Promise<void> {
    try {
      await this.checkEnvironment();
      this.state.isReady = true;
      logger.info('HPM Service 初始化完成');
    } catch (error) {
      logger.error('HPM Service 初始化失败:', String(error));
      this.state.isReady = false;
    }
  }

  /**
   * 检查 HPM 环境
   */
  private async checkEnvironment(): Promise<void> {
    try {
      const hpmDirPath = this.getHPMDirPath();
      if (!hpmDirPath) {
        throw new Error('未找到有效的 HotPE 驱动器');
      }

      const exists = await window.electronAPI.invoke('fs:exists', hpmDirPath);
      if (!exists) {
        await window.electronAPI.invoke('fs:mkdir', hpmDirPath);
        logger.info(`创建 HPM 目录: ${hpmDirPath}`);
      }

      await this.refreshLocalModules();
    } catch (error) {
      logger.error('检查 HPM 环境失败:', String(error));
      throw error;
    }
  }

  /**
   * 获取 HPM 目录路径
   */
  private getHPMDirPath(): string {
    const drive = config.environment.HotPEDrive.new;
    if (!drive || !drive.letter) {
      return '';
    }
    return `${drive.letter}\\HotPE\\HPM`;
  }

  /**
   * 刷新本地模块列表
   */
  async refreshLocalModules(): Promise<void> {
    if (this.isCheckingFiles) {
      return;
    }

    this.isCheckingFiles = true;
    this.state.isLoading = true;

    try {
      const hpmDirPath = this.getHPMDirPath();
      if (!hpmDirPath) {
        this.state.localModules = { enabled: [], disabled: [] };
        return;
      }

      // 获取启用和禁用的模块文件
      const [enabledFiles, disabledFiles] = await Promise.all([
        window.electronAPI.invoke('hpm:getEnabledFiles', hpmDirPath),
        window.electronAPI.invoke('hpm:getDisabledFiles', hpmDirPath)
      ]);

      // 获取模块信息
      const enabledModules = await Promise.all(
        enabledFiles.map((fileName: string) => 
          window.electronAPI.invoke('hpm:getInfo', hpmDirPath, fileName)
        )
      );

      const disabledModules = await Promise.all(
        disabledFiles.map((fileName: string) => 
          window.electronAPI.invoke('hpm:getInfo', hpmDirPath, fileName)
        )
      );

      // 过滤有效模块
      const validEnabledModules = enabledModules.filter(Boolean);
      const validDisabledModules = disabledModules.filter(Boolean);

      // 更新状态
      this.state.localModules.enabled = validEnabledModules;
      this.state.localModules.disabled = validDisabledModules;
      this.state.isLoading = false;

      // 触发渲染回调
      this.render.callRefreshPage();
      this.render.callRefreshNav();

      // 发送更新事件
      eventBus.emit('hpm:refresh', undefined);

      logger.info(`本地 HPM 模块列表已更新: 启用 ${validEnabledModules.length} 个，禁用 ${validDisabledModules.length} 个`);

    } catch (error) {
      logger.error('刷新本地模块列表失败:', String(error));
      this.state.isLoading = false;
    } finally {
      this.isCheckingFiles = false;
    }
  }

  /**
   * 启用模块
   */
  async enableModule(fileName: string): Promise<boolean> {
    try {
      const hpmDirPath = this.getHPMDirPath();
      const success = await window.electronAPI.invoke('hpm:enable', hpmDirPath, fileName);
      
      if (success) {
        await this.refreshLocalModules();
        eventBus.emit('hpm:install', { packageId: fileName });
        Toast.success('模块已启用');
        logger.info(`模块已启用: ${fileName}`);
      } else {
        Toast.error('启用模块失败');
      }
      
      return success;
    } catch (error) {
      logger.error(`启用模块失败: ${fileName}`, String(error));
      Toast.error('启用模块失败');
      return false;
    }
  }

  /**
   * 禁用模块
   */
  async disableModule(fileName: string): Promise<boolean> {
    try {
      const hpmDirPath = this.getHPMDirPath();
      const success = await window.electronAPI.invoke('hpm:disable', hpmDirPath, fileName);
      
      if (success) {
        await this.refreshLocalModules();
        eventBus.emit('hpm:uninstall', { packageId: fileName });
        Toast.success('模块已禁用');
        logger.info(`模块已禁用: ${fileName}`);
      } else {
        Toast.error('禁用模块失败');
      }
      
      return success;
    } catch (error) {
      logger.error(`禁用模块失败: ${fileName}`, String(error));
      Toast.error('禁用模块失败');
      return false;
    }
  }

  /**
   * 删除模块
   */
  async deleteModule(fileName: string): Promise<boolean> {
    try {
      const hpmDirPath = this.getHPMDirPath();
      const success = await window.electronAPI.invoke('hpm:delete', hpmDirPath, fileName);
      
      if (success) {
        await this.refreshLocalModules();
        eventBus.emit('hpm:uninstall', { packageId: fileName });
        Toast.success('模块已删除');
        logger.info(`模块已删除: ${fileName}`);
      } else {
        Toast.error('删除模块失败');
      }
      
      return success;
    } catch (error) {
      logger.error(`删除模块失败: ${fileName}`, String(error));
      Toast.error('删除模块失败');
      return false;
    }
  }

  /**
   * 下载模块
   */
  async downloadModule(hpmInfo: HPM): Promise<boolean> {
    try {
      if (!hpmInfo.dlLink) {
        Toast.error('下载链接无效');
        return false;
      }

      const downloadTask: HPMDl = {
        HPMInfo: hpmInfo,
        taskId: '', // 将由 aria2-service 生成
        dlInfo: {
          state: 'request',
          speed: '0 B/s',
          percentage: 0,
          remainder: '计算中...',
          size: '0 B',
          newSize: '0 B',
          message: '准备下载...'
        }
      };

      this.state.downloadTasks.push(downloadTask);
      this.render.callRefreshPage();

      eventBus.emit('download:start', { taskId: downloadTask.taskId, url: hpmInfo.dlLink });

      // 使用 aria2-service 启动下载
      const taskId = await startDownloadSafe(
        hpmInfo.dlLink, // url
        this.getHPMDirPath(), // saveDir
        hpmInfo.fileName, // saveName
        8, // threads
        (status: Aria2Status) => {
          // 状态更新回调
          this.updateDownloadProgress(taskId!, {
            state: status.state,
            speed: status.speed,
            percentage: status.percentage,
            remainder: status.remainder,
            size: status.size,
            newSize: status.newSize,
            message: status.message
          });
        }
      );

      if (taskId) {
        // 更新任务ID
        downloadTask.taskId = taskId;
        
        Toast.success('下载已开始');
        logger.info(`开始下载模块: ${hpmInfo.name}`);
        return true;
      } else {
        this.removeDownloadTask('');
        Toast.error('启动下载失败');
        return false;
      }
    } catch (error) {
      logger.error(`下载模块失败: ${hpmInfo.name}`, String(error));
      Toast.error('下载失败');
      return false;
    }
  }

  /**
   * 取消下载
   */
  async cancelDownload(taskId: string): Promise<boolean> {
    try {
      const success = await stopDownloadSafe(taskId);
      
      if (success) {
        this.removeDownloadTask(taskId);
        Toast.success('下载已取消');
      } else {
        Toast.error('取消下载失败');
      }
      
      return success;
    } catch (error) {
      logger.error(`取消下载失败: ${taskId}`, String(error));
      Toast.error('取消下载失败');
      return false;
    }
  }

  /**
   * 检查模块是否正在下载
   */
  isDownloading(hpmInfo: HPM): boolean {
    return this.state.downloadTasks.some(task => 
      task.HPMInfo.fileName === hpmInfo.fileName
    );
  }

  /**
   * 获取下载进度百分比
   */
  getDownloadPercent(hpmInfo: HPM): number {
    const task = this.state.downloadTasks.find((t: HPMDl) => t.HPMInfo.fileName === hpmInfo.fileName);
    return task?.dlInfo.percentage || 0;
  }

  /**
   * 更新下载进度
   */
  updateDownloadProgress(taskId: string, status: Aria2Status): void {
    const task = this.state.downloadTasks.find((t: HPMDl) => t.taskId === taskId);
    if (!task) return;

    task.dlInfo = {
      state: status.state,
      percentage: status.percentage || 0,
      speed: status.speed || '0 B/s',
      remainder: status.remainder || '未知',
      newSize: status.newSize || '0 B',
      size: status.size || '0 B',
      message: status.message || ''
    };

    this.render.callRefreshPage();
    eventBus.emit('download:progress', { 
      taskId: task.taskId, 
      progress: task.dlInfo.percentage, 
      speed: task.dlInfo.speed 
    });

    // 处理下载完成
    if (status.state === 'done') {
      this.handleDownloadComplete(task);
    } else if (status.state === 'error') {
      eventBus.emit('download:error', { taskId: task.taskId, error: '下载失败' });
      Toast.error(`下载失败: ${task.HPMInfo.name}`);
    }
  }

  /**
   * 处理下载完成
   */
  private async handleDownloadComplete(task: HPMDl): Promise<void> {
    try {
      await this.refreshLocalModules();
      this.removeDownloadTask(task.taskId);
      
      eventBus.emit('download:complete', { taskId: task.taskId, filePath: '' });
      Toast.success(`下载完成: ${task.HPMInfo.name}`);
      logger.info(`模块下载完成: ${task.HPMInfo.name}`);
      
      this.render.callRefreshResult();
    } catch (error) {
      logger.error(`处理下载完成失败: ${task.HPMInfo.name}`, String(error));
    }
  }

  /**
   * 移除下载任务
   */
  private removeDownloadTask(taskId: string): void {
    const index = this.state.downloadTasks.findIndex(task => task.taskId === taskId);
    if (index !== -1) {
      this.state.downloadTasks.splice(index, 1);
      this.render.callRefreshPage();
    }
  }

  /**
   * 更新在线模块列表
   */
  updateOnlineModules(modules: HPMClass[]): void {
    this.state.onlineModules = modules;
    logger.info(`HPM在线列表已更新: ${modules.length} 个分类`);
  }

  // Getter 方法
  get localModules() { return this.state.localModules; }
  get onlineModules() { return this.state.onlineModules; }
  get downloadTasks() { return this.state.downloadTasks; }
  get isReady() { return this.state.isReady; }
  get isLoading() { return this.state.isLoading; }
}

// 创建单例实例
export const hpmService = new HPMService();

// 搜索功能对象
export const HPMSearch = {
  value: '',
  select: false,
  callRefresh: () => {}
};

// 兼容性导出 - 保持与旧代码的兼容性
//export const HPMListOnline = hpmService.onlineModules;
//export const HPMListLocal = hpmService.localModules;
//export const HPMDlList = hpmService.downloadTasks;

//export const HPMDLRender = hpmService.render;

export const setHPMListOnline = (modules: HPMClass[]) => {
  hpmService.updateOnlineModules(modules);
};

export const delHPM = (fileName: string) => hpmService.deleteModule(fileName);
export const disableHPM = (fileName: string) => hpmService.disableModule(fileName);
export const enableHPM = (fileName: string) => hpmService.enableModule(fileName);

export const isHPMinDlList = (hpmInfo: HPM) => hpmService.isDownloading(hpmInfo);
export const getHPMDlPercent = (hpmInfo: HPM) => hpmService.getDownloadPercent(hpmInfo);
export const newHPMDl = (hpmInfo: HPM) => hpmService.downloadModule(hpmInfo);
export const cancelDlTask = (taskId: string) => hpmService.cancelDownload(taskId);

export const isHPMHaveLocal = (hpmInfo: HPM): boolean => {
  const local = hpmService.localModules;
  return [...local.enabled, ...local.disabled].some(
    localHpm => localHpm.fileName === hpmInfo.fileName
  );
};

// 默认导出
export default hpmService;