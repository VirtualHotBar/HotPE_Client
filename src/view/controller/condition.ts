/**
 * 状态检查控制器 - 重构版本
 * 移除了直接的 UI 依赖，使用事件系统和错误处理
 */

import { config, roConfig } from '../services/config';
import { updateState } from './init';
import { checkPESetting } from './setting/setting';
import {
  getAllLetterInfo,
  getDisksInfo,
  getPartitionsInfo,
  isMoveForDisk,
} from '../utils/disk/diskInfo';
import { errorHandler } from '../services/error-handler';
import { eventBus } from '../services/event-bus';
import { deleteFile, readHotPEConfig, traverseFiles } from '../utils/core/file';
import { isHotPEDrive } from '../utils/core/system';
import { hpmService } from '../services';

/**
 * 检查PE资源
 */
export async function checkPERes(): Promise<boolean> {
  const result = await errorHandler.handleAsync(async () => {
    // 更新本地已有资源列表
    const filesResult = await traverseFiles(`${roConfig.path.resources.pe}*.7z`);
    if (Array.isArray(filesResult)) {
      config.resources.pe.all = filesResult;
    } else {
      config.resources.pe.all = [];
    }

    // 选择最新的资源
    if (config.resources.pe.all.length > 0) {
      config.resources.pe.new = config.resources.pe.all[0];
      eventBus.emit('notification:info', {
        message: `找到 PE 资源: ${config.resources.pe.new}`,
        title: 'PE 资源检查'
      });
    } else {
      config.resources.pe.new = '';
      eventBus.emit('notification:warning', {
        message: '未找到 PE 资源文件',
        title: 'PE 资源检查'
      });
    }

    // 删除旧的PE资源
    for (const fileName of config.resources.pe.all) {
      if (fileName !== config.resources.pe.new) {
        if (await deleteFile(roConfig.path.resources.pe + fileName)) {
          eventBus.emit('notification:info', {
            message: `已删除旧版本: ${fileName}`,
            title: 'PE 资源清理'
          });
        }
      }
    }

    return true;
  }, {
    component: 'ConditionController',
    action: 'checkPERes',
    showToUser: true
  });

  return result ?? false;
}

/**
 * 检查本地的PE驱动器
 */
export async function checkPEDrive(): Promise<boolean> {
  const result = await errorHandler.handleAsync(async () => {
    // 刷新磁盘信息
    await getDisksInfo();
    await getPartitionsInfo();
    await getAllLetterInfo();

  config.state.setupToSys = 'without';

    // 清空现有数据
    config.environment.HotPEDrive.all = [];
    config.environment.HotPEDrive.new = { diskIndex: -1, letter: '', isMove: false, version: '' };
    config.state.setupToSys = 'without';

    let foundDrives = 0;

    // 遍历所有分区查找 HotPE 驱动器
    for (const partition of config.environment.ware.partitions) {
      if (!partition || !partition.letter) {
        continue;
      }

      if (await isHotPEDrive(partition.letter)) {
        try {
          const hotPEConfigResult = await readHotPEConfig(partition.letter);
          if (hotPEConfigResult && hotPEConfigResult['success']) {
            const hotPEConfig = hotPEConfigResult['data'] as Record<string, any>;
            const HotPEDriveInfo = {
              diskIndex: partition.diskIndex,
              letter: partition.letter,
              isMove: isMoveForDisk(partition.diskIndex),
              version: (hotPEConfig?.['information'] as any)?.['ReleaseVersion'] || 'Unknown',
            };

            // 避免重复添加
            const exists = config.environment.HotPEDrive.all.some(
              (drive: any) => drive.letter === HotPEDriveInfo.letter
            );
            
            if (!exists) {
              config.environment.HotPEDrive.all.push(HotPEDriveInfo);
              foundDrives++;
            }

            // 检查是否为系统安装的PE
            if (partition.letter === roConfig.environment.sysLetter) {
              config.state.setupToSys = (hotPEConfig?.['information'] as any)?.['ReleaseVersion'] || 'unknown';
            }
          }
        } catch (error) {
          console.warn(`读取 HotPE 配置失败 [${partition.letter}]:`, error);
        }
      }
    }

    // 选择最新的PE驱动器
    if (config.environment.HotPEDrive.all.length > 0) {
      config.environment.HotPEDrive.new = 
        config.environment.HotPEDrive.all[config.environment.HotPEDrive.all.length - 1];

      eventBus.emit('notification:success', {
        message: `找到 ${foundDrives} 个 HotPE 驱动器`,
        title: 'PE 驱动器检查'
      });

      // 更新HPM列表和设置
     await  hpmService.refreshLocalModules();
      await checkPESetting();
    } else {
      eventBus.emit('notification:info', {
        message: '未找到 HotPE 驱动器',
        title: 'PE 驱动器检查'
      });
    }

    // 更新状态
    await updateState();

    return true;
  }, {
    component: 'ConditionController',
    action: 'checkPEDrive',
    showToUser: true
  });

  return result ?? false;
}
