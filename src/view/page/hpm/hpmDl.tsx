import React, { useReducer, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Button, Nav, Spin } from '@douyinfe/semi-ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { HPMDLRender, HPMListOnline, HPMSearch } from '../../services/hpm';
import type { HPM } from '../../../types/hpm';
import type { HPMTab as HPMTabType } from '../../../types/hpm-page';

import { formatSize } from '../../utils/utils';
import { isHPMinDlList, getHPMDlPercent, newHPMDl } from '../../controller/hpm/hpmDl';
import { isHPMHaveLocal } from '../../controller/hpm/checkHpmFiles';

export default function HPMDl() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectHPMClassIndex, setSelectHPMClassIndex] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  // 使用 useCallback 优化函数
  const handleClassSelect = useCallback((index: number) => {
    setSelectHPMClassIndex(index);
  }, []);

  // 初始化效果
  useEffect(() => {
    // 清空刷新队列
    HPMDLRender.callRefreshDlTab = [];
    HPMSearch.callRefres = forceUpdate;

    // 检查数据是否已初始化
    if (HPMListOnline && Array.isArray(HPMListOnline)) {
      setIsInitialized(true);
    }
  }, [HPMListOnline]);

  // 使用 useMemo 优化模块分类计算
  const hpmClassItems = useMemo(() => {
    const items = [];
    if (HPMSearch.value !== '') {
      items.push({ itemKey: -1, text: '搜索' });
    }
    if (HPMListOnline && Array.isArray(HPMListOnline) && HPMListOnline.length > 0) {
      HPMListOnline.forEach((hpmClass, index) => {
        if (hpmClass?.class) {
          items.push({ itemKey: index, text: hpmClass.class });
        }
      });
    }
    return items;
  }, [HPMListOnline, HPMSearch.value]);

  // 使用 useMemo 优化模块列表计算
  const hpmItems = useMemo(() => {
    if (!HPMListOnline || !Array.isArray(HPMListOnline) || HPMListOnline.length === 0) {
      return [];
    }

    if (selectHPMClassIndex === -1) {
      // 搜索模块
      const searchValue = HPMSearch.value.toLowerCase();
      const items: HPM[] = [];

      HPMListOnline.forEach(hpmClass => {
        if (!hpmClass || hpmClass.class === '推荐') {return;}

        const hpmList = hpmClass.list || [];
        hpmList.forEach(hpm => {
          if (!hpm) {return;}

          const searchText = `${hpm.name}${hpm.description}${hpm.maker}`.toLowerCase();
          if (searchText.includes(searchValue)) {
            items.push(hpm);
          }
        });
      });

      return items;
    } else {
      const selectedClass = HPMListOnline[selectHPMClassIndex];
      return selectedClass?.list?.filter(item => item != null) || [];
    }
  }, [HPMListOnline, selectHPMClassIndex, HPMSearch.value]);

  // 创建虚拟化器
  const virtualizer = useVirtualizer({
    count: hpmItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  // 处理搜索选择
  useEffect(() => {
    if (HPMSearch.select === true) {
      setSelectHPMClassIndex(-1);
      HPMSearch.select = false;
    } else if (selectHPMClassIndex === -1 && HPMSearch.value === '') {
      // 确保有可用的分类才设置索引
      if (HPMListOnline && Array.isArray(HPMListOnline) && HPMListOnline.length > 0) {
        setSelectHPMClassIndex(0);
      }
    }
  }, [selectHPMClassIndex, HPMSearch.select, HPMSearch.value]);

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <div style={{ height: '100%' }}>
        <Nav
          selectedKeys={[String(selectHPMClassIndex)]}
          style={{ height: '100%', width: '120px' }}
          bodyStyle={{ height: 'calc(100% - 15px)' }}
          defaultOpenKeys={[]}
          items={hpmClassItems}
          onSelect={data => handleClassSelect(Number(data.itemKey))}
        />
      </div>

      <div style={{ height: '100%', width: '100%', textAlign: 'center' }}>
        <div style={{ height: '100%', width: '100%' }}>
          {!isInitialized ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              加载中...
            </div>
          ) : hpmItems.length > 0 ? (
            <div
              ref={parentRef}
              style={{
                height: '100%',
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map(virtualItem => {
                  const hpmItem = hpmItems[virtualItem.index];
                  if (!hpmItem) {return null;}

                  return (
                    <HPMTab
                      key={virtualItem.key}
                      Row={{
                        index: virtualItem.index,
                        style: {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        },
                      }}
                      HPM={hpmItem}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              没有找到相关模块
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const HPMTab = React.memo((props: HPMTabType) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    // 正在下载的项目，加入刷新队列（不重复）
    if (isHPMinDlList(props.HPM) && !HPMDLRender.callRefreshDlTab.includes(forceUpdate)) {
      HPMDLRender.callRefreshDlTab.push(forceUpdate);
    }
  }, [props.HPM]);

  const handleDownload = useCallback(() => {
    newHPMDl(props.HPM);
    forceUpdate();
  }, [props.HPM]);

  const isInstalled = useMemo(() => isHPMHaveLocal(props.HPM), [props.HPM]);
  const isDownloading = useMemo(() => isHPMinDlList(props.HPM), [props.HPM]);
  const downloadPercent = useMemo(() => getHPMDlPercent(props.HPM), [props.HPM]);

  const hpmInfo = useMemo(
    () => `${props.HPM.version} | ${props.HPM.maker} | ${formatSize(props.HPM.size)}`,
    [props.HPM.version, props.HPM.maker, props.HPM.size]
  );

  return (
    <div style={props.Row.style}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          border: '1px solid var(--semi-color-border)',
          borderRadius: '4px',
          margin: '2px 4px',
        }}
      >
        <div
          style={{
            width: 'calc(100% - 115px)',
            textAlign: 'left',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                color: 'var(--semi-color-text-0)',
                fontWeight: 'bold',
                verticalAlign: 'middle',
              }}
            >
              {props.HPM.name}
            </span>
            <span
              style={{
                color: 'var(--semi-color-text-1)',
                marginLeft: '10px',
                verticalAlign: 'middle',
                fontSize: '12px',
              }}
            >
              {hpmInfo}
            </span>
          </div>

          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--semi-color-text-2)',
              fontSize: '13px',
            }}
          >
            {props.HPM.description}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            padding: '8px',
          }}
        >
          {isInstalled ? (
            <div
              style={{
                color: 'var(--semi-color-success)',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              已安装
            </div>
          ) : !isDownloading ? (
            <Button size='small' onClick={handleDownload}>
              下载
            </Button>
          ) : downloadPercent > -1 ? (
            <Spin tip={`${downloadPercent}%`} size='small' />
          ) : (
            <div
              style={{
                color: 'var(--semi-color-danger)',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              出错
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
