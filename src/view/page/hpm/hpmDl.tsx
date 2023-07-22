import React, { useState, useReducer, useEffect } from 'react';
import { Tabs, TabPane, RadioGroup, Radio, Button, Nav, Card, Descriptions, Spin, Progress } from '@douyinfe/semi-ui';
import { IconFile, IconGlobe, IconHelpCircle } from '@douyinfe/semi-icons';
import { HPMDLRender, HPMDlList, HPMListOnline } from '../../services/hpm';
import { HPM, HPMClass, HPMDl } from '../../type/hpm';
import { HPMTab } from '../../type/page/hpm/hpmDl';
import { AutoSizer } from 'react-virtualized';
import { Typography } from '@douyinfe/semi-ui';
import { FixedSizeList } from 'react-window';
import { formatSize } from '../../utils/utils';
import { isHPMinDlList, getHPMDlPercent, newHPMDl } from '../../controller/hpm/hpmDl';
import { isHPMHaveLocal } from '../../controller/hpm/checkHpmFiles';

const { Text } = Typography;



let selectHPMClassIndex = 0

export default function HPMDl() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新组件

    function setSelectHPMClassIndex(index: number) {
        selectHPMClassIndex = index
        forceUpdate()
    }

    //清空刷新队列
    HPMDLRender.callRefreshDlTab = []

    return (
        <div style={{ height: '100% ', display: 'flex' }} >

            <div style={{ height: '100%' }}>
                <Nav
                    defaultSelectedKeys={[selectHPMClassIndex]}
                    //selectedKeys={[selectHPMClassIndex]}
                    style={{ height: '100%', width: '120px' }}
                    bodyStyle={{ height: 'calc(100% - 15px)', }}
                    defaultOpenKeys={[]}
                    items={HPMListOnline.map((HPMList: HPMClass, index) => { return { itemKey: index, text: HPMList.class } }) as any}
                    onSelect={data => setSelectHPMClassIndex(Number(data.itemKey))}
                />
            </div>

            {/* </div><div style={{ height: 'calc(100% - 20px)', width: 'calc(100% - 20px)', padding: '10px' }}> */}
            <div style={{ height: '100% ', width: '100%', textAlign: 'center' }}>

                <AutoSizer>
                    {({ height, width }) => (
                        <FixedSizeList
                            height={height}
                            itemCount={HPMListOnline[selectHPMClassIndex].list.length}
                            itemSize={70}
                            width={width}
                        >
                            {({ index, style }) => (
                                <HPMTab Row={{ index, style }} HPM={HPMListOnline[selectHPMClassIndex].list[index]} ></HPMTab>
                            )}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            </div>
        </div>
    )
};

function HPMTab(props: HPMTab) {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新组件

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

