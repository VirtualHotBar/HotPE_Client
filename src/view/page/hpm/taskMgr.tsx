import { Button, Collapse, List } from '@douyinfe/semi-ui';
import React, { useEffect, useReducer, useState } from 'react';
import { HPMDLRender, HPMDlList, HPMListLocal } from '../../services/hpm';
import { HPM } from '../../type/hpm';
import { cancelDlTask } from '../../controller/hpm/hpmDl';


export default function TaskMgr() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新页面


    HPMDLRender.length = 0
    HPMDLRender.push(forceUpdate)

    useEffect(() => {




        // Update the document title using the browser 
    });

    const style = {

        border: '1px solid var(--semi-color-border)',
        backgroundColor: 'var(--semi-color-bg-2)',
        borderRadius: '3px',
        paddingLeft: '20px',
        margin: '8px 2px',
    };
    return (
        <>

            {<List

                dataSource={HPMDlList}
                renderItem={HPMDlInfo => (
                    <List.Item style={style}>
                        <div style={{ display: 'flex', width: "100%" }}>
                            <div style={{ width: "100%" }}>
                                <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 600 }}>{HPMDlInfo.HPMInfo.name}</a>
                                <br />
                                <a style={{ color: 'var(--semi-color-text-1)' }}>下载中：{HPMDlInfo.dlInfo.percentage}%({HPMDlInfo.dlInfo.speed})|剩余时间:{HPMDlInfo.dlInfo.remainder} | {HPMDlInfo.dlInfo.newSize}/{HPMDlInfo.dlInfo.size}</a>
                            </div>

                            <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'flex-end', width: "100%" }}>
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