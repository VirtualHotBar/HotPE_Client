import { Button, Collapse, List, Typography } from '@douyinfe/semi-ui';
import React, { useEffect, useReducer, useState } from 'react';
import { HPMDLRender, HPMDlList, HPMListLocal } from '../../services/hpm';
import { HPM } from '../../type/hpm';
import { cancelDlTask, newHPMDl } from '../../controller/hpm/hpmDl';

const { Text } = Typography;

export default function TaskMgr() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新页面

    useEffect(() => {
        HPMDLRender.callRefreshPage = forceUpdate
        // Update the document title using the browser 
    });

    const style = {
        border: '1px solid var(--semi-color-border)',
        backgroundColor: 'var(--semi-color-bg-2)',
        borderRadius: '3px',
        paddingLeft: '20px',
        margin: '8px 2px ',
    };
    return (
        <>

            {<List
            style={{padding:'6px'}}

                dataSource={HPMDlList}
                renderItem={HPMDlInfo => (
                    <List.Item style={style}>
                        <div style={{ display: 'flex', width: "100%" }}>
                            <div style={{ width: "calc(100% - 150px)" }}>
                                <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 600 }}>{HPMDlInfo.HPMInfo.name}</a>
                                <br />
                                <a style={{ marginTop: '5px',color: 'var(--semi-color-text-1)' }}>

                                {
                                    HPMDlInfo.dlInfo.state == 'request' ? <>请求中...</>
                                        : HPMDlInfo.dlInfo.state == 'doing' ? <>下载中：{HPMDlInfo.dlInfo.percentage}%({HPMDlInfo.dlInfo.speed})|剩余时间:{HPMDlInfo.dlInfo.remainder} | {HPMDlInfo.dlInfo.newSize}/{HPMDlInfo.dlInfo.size}</>
                                            : HPMDlInfo.dlInfo.state == 'error' ? <Text  ellipsis={{ showTooltip: true }}>{`下载出错:${HPMDlInfo.dlInfo.message}`}</Text> : <></>



                                }
                                </a>

                            </div>

                            <div style={{ width: "150px",textAlign:'right'}}>
                                {HPMDlInfo.dlInfo.state == 'error' ?
                                    <Button style={{ marginRight: 8 }} type='primary' onClick={async () => {
                                        newHPMDl(HPMDlInfo.HPMInfo)
                                        forceUpdate()
                                    }}>重试</Button>
                                    :<></>
                                }

                                <Button style={{ marginRight: 8 }} type="danger" onClick={async () => {
                                        await cancelDlTask(HPMDlInfo)
                                        forceUpdate()
                                    }}>取消</Button>

                            </div>
                        </div>
                    </List.Item>
                )}
            />}

        </>
    )



};