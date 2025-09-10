import React, { useReducer, useEffect, useState } from 'react';
import { Button, Nav, Spin } from '@douyinfe/semi-ui';
import { List } from 'react-window';
import { HPMDLRender, HPMListOnline, HPMSearch } from '../../services/hpm';
import type { HPM } from '../../type/hpm';
import type { HPMTab as HPMTabType } from '../../type/page/hpm/hpmDl';

import { formatSize } from '../../utils/utils';
import { isHPMinDlList, getHPMDlPercent, newHPMDl } from '../../controller/hpm/hpmDl';
import { isHPMHaveLocal } from '../../controller/hpm/checkHpmFiles';



let selectHPMClassIndex = 0

export default function HPMDl() {
    const [, forceUpdate] = useReducer(x => x + 1, 0);//刷新组件
    const [isInitialized, setIsInitialized] = useState(false);
    
    function setSelectHPMClassIndex(index: number) {
        selectHPMClassIndex = index
        forceUpdate()
    }

    //清空刷新队列
    HPMDLRender.callRefreshDlTab = []

    HPMSearch.callRefres = forceUpdate

    // 检查数据是否已初始化
    useEffect(() => {
        if (HPMListOnline && Array.isArray(HPMListOnline)) {
            setIsInitialized(true);
        }
    }, [HPMListOnline]);

    //模块分类
    function HPMClassItems() {
        let items = []
        if (HPMSearch.value != '') {
            items.push({ itemKey: -1, text: '搜索' })
        }
        if (HPMListOnline && Array.isArray(HPMListOnline) && HPMListOnline.length > 0) {
            for (let i = 0; i < HPMListOnline.length; i++) {
                const hpmClass = HPMListOnline[i]
                if (hpmClass && hpmClass.class) {
                    items.push({ itemKey: i, text: hpmClass.class })
                }
            }
        }
        return items
    }


    //模块列表
    let HPMItems: Array<HPM> = []
    if (HPMListOnline && Array.isArray(HPMListOnline) && HPMListOnline.length > 0) {
        if (selectHPMClassIndex == -1) {
            //搜索模块
            for (let i = 0; i < HPMListOnline.length; i++) {
                const hpmClass = HPMListOnline[i]
                if (!hpmClass || hpmClass.class === '推荐') {
                    continue
                }

                const HPMListTemp = hpmClass.list || []

                for (let j = 0; j < HPMListTemp.length; j++) {
                    const tempHPM = HPMListTemp[j]
                    if (!tempHPM) continue;
                    if ((tempHPM.name + tempHPM.description + tempHPM.maker).toLowerCase().includes(HPMSearch.value.toLowerCase())) {
                        HPMItems.push(tempHPM)
                    }
                }
            }
        } else {
            const selectedClass = HPMListOnline[selectHPMClassIndex]
            if (selectedClass && selectedClass.list) {
                HPMItems = selectedClass.list.filter(item => item != null && item != undefined)
            }
        }
    }

    // 确保HPMItems始终是一个有效的数组
    HPMItems = Array.isArray(HPMItems) ? HPMItems : []



    useEffect(() => {

        //选择搜索项
        if (HPMSearch.select == true) {
            setSelectHPMClassIndex(-1)
            HPMSearch.select = false
        } else {
            if (selectHPMClassIndex == -1 && HPMSearch.value == '') {
                // 确保有可用的分类才设置索引
                if (HPMListOnline && Array.isArray(HPMListOnline) && HPMListOnline.length > 0) {
                    setSelectHPMClassIndex(0)
                }
            }
        }

    }, [selectHPMClassIndex])





    return (
        <div style={{ height: '100% ', display: 'flex' }} >

            <div style={{ height: '100%' }}>
                <Nav
                    selectedKeys={[String(selectHPMClassIndex)]}
                    style={{ height: '100%', width: '120px' }}
                    bodyStyle={{ height: 'calc(100% - 15px)', }}
                    defaultOpenKeys={[]}
                    items={HPMClassItems()}
                    onSelect={data => setSelectHPMClassIndex(Number(data.itemKey))}
                />
            </div>

            {/* </div><div style={{ height: 'calc(100% - 20px)', width: 'calc(100% - 20px)', padding: '10px' }}> */}
            <div style={{ height: '100% ', width: '100%', textAlign: 'center' }}>

                <div style={{ height: '100%', width: '100%' }}>
                  {!isInitialized ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      加载中...
                    </div>
                  ) : HPMListOnline && Array.isArray(HPMListOnline) && HPMListOnline.length > 0 && HPMItems.length > 0 ? (
                    <List
                      height={500}
                      itemCount={HPMItems.length}
                      itemSize={70}
                      width={500}
                      itemData={HPMItems}
                    >
                      {({ index, style, data }: { index: number; style: React.CSSProperties; data: Array<HPM> }) => {
                        // 确保 data 是数组且 index 在有效范围内
                        if (!Array.isArray(data) || index < 0 || index >= data.length) {
                          return <div style={style}></div>;
                        }
                        
                        const hpmItem = data[index];
                        return hpmItem ? (
                          <HPMTab Row={{ index, style }} HPM={hpmItem} />
                        ) : (
                          <div style={style}></div>
                        );
                      }}
                    </List>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      没有找到相关模块
                    </div>
                  )}
                </div>
            </div>
        </div>
    )
};


function HPMTab(props: HPMTabType) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);//刷新组件

    useEffect(() => {

        //正在下载的项目，加入刷新队列（不重复
        if (isHPMinDlList(props.HPM) && !HPMDLRender.callRefreshDlTab.includes(forceUpdate)) {
            HPMDLRender.callRefreshDlTab.push(forceUpdate)
        }

    }, [props.HPM])

    return <div style={props.Row.style}>
        <div style={{ height: '100%', display: 'flex', border: '1px solid var(--semi-color-border)' }} >
            <div style={{ width: "calc(100% - 115px)", textAlign: 'left', padding: 10 }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ color: 'var(--semi-color-text-0)', fontWeight: 'bold', verticalAlign: 'middle' }}>{props.HPM.name}</span>
                    <span style={{ color: 'var(--semi-color-text-1)', marginLeft: '10px', verticalAlign: 'middle' }}>{`${props.HPM.version} | ${props.HPM.maker} | ${formatSize(props.HPM.size)}`}</span>
                </div>

                <br />
                <div style={{ marginTop: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {props.HPM.description}
                </div>
                <br />
            </div>

            <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'flex-end', width: "55px", padding: '0px' }}>
                {isHPMHaveLocal(props.HPM) ? <>
                    <div style={{ marginTop: "40%", width: '100%', marginRight: '-14px' }}>
                        已安装
                    </div></>
                    : <>
                        {!isHPMinDlList(props.HPM)
                            ? <Button style={{ marginTop: "35%", marginRight: '-20px' }} onClick={() => {
                                newHPMDl(props.HPM)
                                forceUpdate()
                            }}>下载</Button>
                            : <>{
                                getHPMDlPercent(props.HPM) > -1
                                    ? <Spin style={{ marginTop: "40%", width: '100%', marginRight: '-20px' }} tip={getHPMDlPercent(props.HPM) + '%'} />
                                    : <div style={{ marginTop: "40%", width: '100%', marginRight: '-14px', color: 'var(--semi-color-danger)' }}>
                                        出错
                                    </div>
                            }

                            </>}
                    </>}

            </div>

        </div>
    </div>
}
