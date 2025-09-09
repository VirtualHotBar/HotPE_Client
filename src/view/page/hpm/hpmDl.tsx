import React, { useReducer, useEffect } from 'react';
import { Button, Nav, Spin, Typography } from '@douyinfe/semi-ui';
import { HPMDLRender, HPMListOnline, HPMSearch } from '../../services/hpm';
import type { HPM } from '../../type/hpm';
import type { HPMTab as HPMTabType } from '../../type/page/hpm/hpmDl';
import { FixedSizeList } from 'react-window';

import { formatSize } from '../../utils/utils';
import { isHPMinDlList, getHPMDlPercent, newHPMDl } from '../../controller/hpm/hpmDl';
import { isHPMHaveLocal } from '../../controller/hpm/checkHpmFiles';

const { Text } = Typography;



let selectHPMClassIndex = 0

export default function HPMDl() {
    const [, forceUpdate] = useReducer(x => x + 1, 0);//刷新组件
    function setSelectHPMClassIndex(index: number) {
        selectHPMClassIndex = index
        forceUpdate()
    }

    //清空刷新队列
    HPMDLRender.callRefreshDlTab = []

    HPMSearch.callRefres = forceUpdate

    //模块分类
    function HPMClassItems() {
        let items = []
        if (HPMSearch.value != '') {
            items.push({ itemKey: -1, text: '搜索' })
        }
        for (let i in HPMListOnline) {
            items.push({ itemKey: Number(i), text: HPMListOnline[i]?.class || '' })
        }
        return items
    }


    //模块列表
    let HPMItems: Array<HPM> = []
    if (selectHPMClassIndex == -1) {
        //搜索模块
        for (let i in HPMListOnline) {
            if (HPMListOnline[i]?.class == '推荐') {
                continue
            }

            let HPMListTemp = HPMListOnline[i]?.list || []

            for (let i_ in HPMListTemp) {
                let tempHPM: HPM | undefined = HPMListTemp[i_]
                if (!tempHPM) continue;
                if ((tempHPM.name+tempHPM.description+tempHPM.maker).toLowerCase().includes(HPMSearch.value.toLowerCase())) {
                    HPMItems.push(tempHPM)
                }
            }
        }
    } else {
        HPMItems = HPMListOnline[selectHPMClassIndex]?.list || []
    }



    useEffect(() => {

        //选择搜索项
        if (HPMSearch.select == true) {
            setSelectHPMClassIndex(-1)
            HPMSearch.select = false
        } else {
            if (selectHPMClassIndex == -1 && HPMSearch.value == '') {
                setSelectHPMClassIndex(0)
            }
        }

    })





    return (
        <div style={{ height: '100% ', display: 'flex' }} >

            <div style={{ height: '100%' }}>
                <Nav
                    defaultSelectedKeys={[selectHPMClassIndex]}
                    //selectedKeys={[selectHPMClassIndex]}
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
                  {React.createElement(FixedSizeList as any, {
                    height: 500,
                    itemCount: HPMItems.length,
                    itemSize: 70,
                    width: 500,
                    children: ({ index, style }: { index: number; style: React.CSSProperties }) => (
                      HPMItems[index] ? <HPMTab Row={{ index, style }} HPM={HPMItems[index]!} ></HPMTab> : null
                    )
                  })}
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

    })

    return <div style={props.Row.style}>
        <div style={{ height: '100%', display: 'flex', border: '1px solid var(--semi-color-border)' }} >
            <div style={{ width: "calc(100% - 115px)", textAlign: 'left', padding: 10 }}>
                <a style={{ whiteSpace: 'nowrap' }}>
                    <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 'bold', verticalAlign: 'middle' }}>{props.HPM.name}</a>
                    <Text style={{ color: 'var(--semi-color-text-1)', marginLeft: '10px', verticalAlign: 'middle' }} ellipsis={{ showTooltip: true }}>{`${props.HPM.version} | ${props.HPM.maker} | ${formatSize(props.HPM.size)}`}</Text>
                </a>

                <br />
                <Text style={{ marginTop: '5px' }} ellipsis={{ showTooltip: true }}>{props.HPM.description}</Text>
                <br />
            </div>

            <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'flex-end', width: "55px", padding: '0px' }}>
                {isHPMHaveLocal(props.HPM) ? <>
                    <Text style={{ marginTop: "40%", width: '100%', marginRight: '-14px' }} >已安装</Text></>
                    : <>
                        {!isHPMinDlList(props.HPM)
                            ? <Button style={{ marginTop: "35%", marginRight: '-20px' }} onClick={() => {
                                newHPMDl(props.HPM)
                                forceUpdate()
                            }}>下载</Button>
                            : <>{
                                getHPMDlPercent(props.HPM) > -1
                                    ? <Spin style={{ marginTop: "40%", width: '100%', marginRight: '-20px' }} tip={getHPMDlPercent(props.HPM) + '%'} />
                                    : <Text style={{ marginTop: "40%", width: '100%', marginRight: '-14px' }} type="danger" >出错</Text>
                            }

                            </>}
                    </>}

            </div>

        </div>
    </div>
}
