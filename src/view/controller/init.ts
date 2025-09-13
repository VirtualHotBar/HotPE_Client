import { config, roConfig } from '../services/config';
import { createLogger } from '../services/logger';
import { checkUpdate } from './update';
import { checkPERes, checkPEDrive } from './condition';
import { getHPMList, getNotices } from './online/online';
import { errorDialog } from './log';
import { exitapp } from '../layout/header';
import { HotPEDriveChoose } from '../page/setting';
import { runCmd } from '../utils/command';
import './setting/themeMode';
import { makeDir } from '../utils/core/file';

const logger = createLogger('InitController');
let isInitDone = false;

export async function initClient(setStartStr: Function) {
  logger.info('开始初始化客户端');
  
  try {
    await Promise.all([initDir(), getSystemInfo()]);

    setStartStr('检查环境');
    await checkEnvironment();
    await Promise.all([checkPEDrive(), checkPERes()]);

    setStartStr('检查更新');
    await Promise.all([getNotices(), checkUpdate()]);
    await updateState();
    await getHPMList();

    isInitDone = true;

    // 多个HotPE安装时显示选择界面
    if (config.environment.HotPEDrive.all.length > 1) {
      HotPEDriveChoose(() => {});
    }

    logger.info('客户端初始化完成');
  } catch (error) {
    logger.error('客户端初始化失败','initClient', error);
    throw error;
  }
}

/**
 * 更新状态
 */
export async function updateState() {
  config.state.install = !config.resources.pe.new ? 'noDown' 
    : config.environment.HotPEDrive.all.length === 0 ? 'noSetup' 
    : 'ready';
  
  logger.info(`状态更新为: ${config.state.install}`);
}

/**
 * 创建目录，运行所需的
 */
async function initDir() {
  logger.info('初始化目录结构');
  
  try {
    await Promise.all([
      makeDir(roConfig.path.clientTemp),
      makeDir(roConfig.path.resources.client),
      makeDir(roConfig.path.resources.pe)
    ]);
    
    logger.info('目录结构初始化完成');
  } catch (error) {
    logger.error('目录结构初始化失败','initDir', error);
    throw error;
  }
}

/**
 * 环境检查，启动时
 */
async function checkEnvironment() {
  logger.info('开始环境检查');

  // 联网检查
  if (!window.navigator.onLine) {
    logger.warn('网络连接检查失败，功能将受限');
    await errorDialog('已离线', '未连接互联网，功能将受限，点击[确定]继续。');
  }

  // 路径检查
  if (roConfig.path.execDir.includes(' ')) {
    logger.error('执行路径包含空格', 'checkEnvironment', { path: roConfig.path.execDir });
    await errorDialog('错误', '请在无空格路径下运行！');
    exitapp();
  }

  logger.info('环境检查完成');
}

/**
 * 获取系统信息
 */
export async function getSystemInfo() {
  logger.info('获取系统信息');
  
  try {
    const result = await runCmd(`${roConfig.path.tools}BootMode.exe`) as string;
    config.environment.ware.system.firmware = result.includes('UEFI') ? 'UEFI' : 'Legacy';
    logger.info(`系统固件类型: ${config.environment.ware.system.firmware}`);
  } catch (error) {
    logger.error('获取系统信息失败','getSystemInfo', error);
    config.environment.ware.system.firmware = 'Legacy';
  }
}

/**
 * 客户端是否准备就绪（客户端启动完成 and PE包是否下载）
 */
export function isClientReady(): boolean {
  const ready = isInitDone && !!config.resources.pe.new;
  
  if (!ready) {
    logger.debug('客户端未准备就绪','isClientReady', { isInitDone, hasPEResource: !!config.resources.pe.new });
  }
  
  return ready;
}
