import { config, roConfig } from '../services/config';

import { startDownloadSafe, stopDownloadSafe } from '../services/aria2-service';
import { checkPERes } from './condition';
import { updateState } from './init';
import { checkUpdate } from './update';
import { Aria2Status } from '../../types/aria2';

// 活动的下载任务
const activeDownloads = new Map<string, string>();

export async function dlPERes(setDlPercent: Function, setDlSpeed: Function, callback: Function) {
  const url = config.resources.pe.update.download_url;
  const saveDir = roConfig.path.resources.pe;
  const saveName = `${config.resources.pe.update.id}.7z`;
  const threads = config.download.thread;

  try {
    const taskId = await startDownloadSafe(
      url,
      saveDir,
      saveName,
      threads,
      async (status: Aria2Status) => {
        if (status.state != 'error' && status.state != 'done') {
          setDlPercent(status.percentage);
          if (status.state == 'doing') {
            setDlSpeed(`${status.speed}(${status.newSize}\\${status.size},${status.remainder})`);
          } else {
            setDlSpeed('请求中...');
          }
        } else if (status.state == 'done') {
          //检查资源
          await checkPERes();
          //检查更新
          await checkUpdate();
          //更新状态
          await updateState();

          setDlPercent(-1);
          activeDownloads.delete('pe-download');
        } else {
          setDlPercent(-1);
          activeDownloads.delete('pe-download');
        }

        callback(status);
      }
    );

    if (taskId) {
      activeDownloads.set('pe-download', taskId);
    }
  } catch (error) {
    console.error('启动PE资源下载失败:', error);
    setDlPercent(-1);
    callback({
      state: 'error',
      speed: '',
      percentage: 0,
      remainder: '',
      size: '',
      newSize: '',
      message: '下载启动失败',
    });
  }
}

export async function dlClientRes(setDlPercent: Function, setDlSpeed: Function, callback: Function) {
  const url = config.resources.client.update.download_url;
  const saveDir = roConfig.path.resources.client;
  const saveName = config.resources.pe.update.fileName;
  const threads = config.download.thread;

  try {
    const taskId = await startDownloadSafe(
      url,
      saveDir,
      saveName,
      threads,
      async (status: Aria2Status) => {

        if (status.state != 'error' && status.state != 'done') {
          setDlPercent(status.percentage);
          if (status.state == 'doing') {
            setDlSpeed(`${status.speed}(${status.newSize}\\${status.size},${status.remainder})`);
          } else {
            setDlSpeed('请求中...');
          }
        } else if (status.state == 'done') {
          //检查更新
          await checkUpdate();
          //更新状态
          await updateState();
          activeDownloads.delete('client-download');
        } else {
          setDlPercent(-1);
          activeDownloads.delete('client-download');
        }

        callback(status);
      }
    );

    if (taskId) {
      activeDownloads.set('client-download', taskId);
    }
  } catch (error) {
    console.error('启动客户端资源下载失败:', error);
    setDlPercent(-1);
    callback({
      state: 'error',
      speed: '',
      percentage: 0,
      remainder: '',
      size: '',
      newSize: '',
      message: '下载启动失败',
    });
  }
}

// 停止下载的辅助函数
export async function stopPEDownload(): Promise<boolean> {
  const taskId = activeDownloads.get('pe-download');
  if (taskId) {
    const result = await stopDownloadSafe(taskId);
    if (result) {
      activeDownloads.delete('pe-download');
    }
    return result;
  }
  return false;
}

export async function stopClientDownload(): Promise<boolean> {
  const taskId = activeDownloads.get('client-download');
  if (taskId) {
    const result = await stopDownloadSafe(taskId);
    if (result) {
      activeDownloads.delete('client-download');
    }
    return result;
  }
  return false;
}
