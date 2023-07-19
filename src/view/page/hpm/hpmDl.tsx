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
import { HPMisDling, getHPMDlPercent, newHPMDl } from '../../controller/hpm/hpmDl';
import { isHPMHaveLocal } from '../../controller/hpm/checkHpmFiles';

const { Text } = Typography;



let selectHPMClassIndex = 0

export default function HPMDl() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新组件

    function setSelectHPMClassIndex(index: number) {
        selectHPMClassIndex = index
        forceUpdate()
    }

    return (
        <div style={{ height: '100% ', display: 'flex' }} >

            <div style={{ height: '100%' }}>
                <Nav
                    defaultSelectedKeys={[selectHPMClassIndex]}
                    //selectedKeys={[selectHPMClassIndex]}
                    style={{ height: '100%', width: '120px' }}
                    bodyStyle={{ height: '100%' }}
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
        HPMDLRender.length = 0
        HPMDLRender.push( forceUpdate)
    })


    return <div style={props.Row.style}>
        <div style={{ height: '100%', display: 'flex', border: '1px solid var(--semi-color-border)' }} >
            <div style={{ width: "calc(100% - 115px)", textAlign: 'left', padding: 10 }}>
                <a style={{ color: 'var(--semi-color-text-0)', fontSize: '15px', fontWeight: 'bold' }}>{props.HPM.name}</a>

                < a style={{ color: 'var(--semi-color-text-1)', marginLeft: '10px' }} >{props.HPM.version} | {props.HPM.maker} | {formatSize(props.HPM.size)}</a>
                <br />
                < Text style={{ marginTop: '5px' }} ellipsis={{ showTooltip: true }}>{props.HPM.description}</Text>
                <br />
            </div>

            <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'flex-end', width: "55px", padding: '0px' }}>
                {isHPMHaveLocal(props.HPM) ? <>
                    <Text style={{ marginTop: "40%", width: '100%', marginRight: '-14px' }} >已安装</Text></>
                    :<>
                    
                    
                    
                    {!HPMisDling(props.HPM)
                        ? <Button style={{ marginTop: "35%", marginRight: '-20px' }} onClick={() => {
                            newHPMDl(props.HPM)
                            forceUpdate()
                        }}>下载</Button>
                        : <Spin style={{ marginTop: "40%", width: '100%', marginRight: '-20px' }} tip="下载中" />}</>}

            </div>

        </div>
    </div>
}

