import React from 'react';
import { Modal, TreeSelect } from '@douyinfe/semi-ui';
import { config } from '../services/config';
import { checkPESetting } from '../controller/setting/setting';
import { updateState } from '../controller/init';
import { hpmService } from '../services';
import { TreeSelectOption } from '../../types/page-props';

/**
 * 多个PE安装时选择对话框
 */
export function HotPEDriveChoose(callback: Function) {
  if (config.environment.HotPEDrive.all.length > 1) {
    const driveData: TreeSelectOption[] = config.environment.HotPEDrive.all.map(
      (currentValue: { letter: string }, index: number) => {
        return { label: currentValue.letter, value: currentValue.letter, key: index.toString() };
      }
    );

    const modalContent = (
      <>
        <p>请选择要操作的HotPE安装：</p>

        <TreeSelect
          defaultValue={config.environment.HotPEDrive.new.letter}
          style={{ width: '100%' }}
          dropdownStyle={{ overflow: 'auto' }}
          treeData={driveData}
          onSelect={async (value: string) => {
            config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[value];

            // 获取本地HPM列表,刷新一下
            await hpmService.refreshLocalModules();

            // 获取设置
            await checkPESetting();

            console.log(value, config.environment.HotPEDrive.all[value]);
          }}
        />
      </>
    );

    Modal.confirm({
      title: '检测到安装了多个HotPE',
      content: modalContent,
      maskClosable: false,
      closable: false,
      hasCancel: false,
      onOk: () => {
        updateState();
        callback();
      },
      centered: true,
    });
  }
}