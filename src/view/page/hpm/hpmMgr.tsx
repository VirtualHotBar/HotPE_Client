import { Button, Collapse, List, TabPane, Tabs, Typography } from '@douyinfe/semi-ui';
import React, { useState, useReducer } from 'react';
import { delHPM, disableHPM, enableHPM } from '../../controller/hpm/setHpm';
import { HPMListLocal } from '../../services/hpm';
import { formatSize } from '../../utils/utils';

const { Text } = Typography;

export default function HPMMgr() {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新页面

    const style = {

        border: '1px solid var(--semi-color-border)',
        backgroundColor: 'var(--semi-color-bg-2)',
        borderRadius: '3px',
        paddingLeft: '20px',
        margin: '8px 2px',
    };
    return (
        <>
            <Collapse defaultActiveKey = {['on','off']}>
                <Collapse.Panel header={"已启用："} itemKey="on"  extra={HPMListLocal.on.length}>
                    <List
                        dataSource={HPMListLocal.on}
                        renderItem={onHPM => (
                            <List.Item style={style}>
                                <div style={{  display: 'flex', width: "100%" }}>
                                    <div style={{  width: "calc(100% - 150px)"  }}>
                                        
                                        <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 600 }}>{onHPM.name}</a>
                                        <br />
                                        <Text style={{ color: 'var(--semi-color-text-1)' }} ellipsis={{ showTooltip: true }}>{`${onHPM.version} | ${onHPM.maker} | ${formatSize(onHPM.size)}`}</Text>
                                    </div>

                                    <div style={{ width: "150px",textAlign:'right'}}>
                                        <Button style={{ marginRight: 8 }} type='warning' onClick={async () => {
                                            await disableHPM(onHPM.fileName)
                                            forceUpdate()
                                        }}>禁用</Button>
                                        <Button style={{ marginRight: 8 }} type="danger" onClick={async () => {
                                            await delHPM(onHPM.fileName)
                                            forceUpdate()
                                        }}>删除</Button>

                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Collapse.Panel>
                <Collapse.Panel header={"已禁用："} itemKey="off" extra={HPMListLocal.off.length}>
                    <List
                        dataSource={HPMListLocal.off}
                        renderItem={offHPM => (
                            <List.Item style={style}>
                                <div style={{ display: 'flex', width: "100%" }}>
                                    <div style={{ width: "100%" }}>
                                        <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 600 }}>{offHPM.name}</a>
                                        <br />
                                        <a style={{ color: 'var(--semi-color-text-1)' }}>{offHPM.version} | {offHPM.maker} | {formatSize(offHPM.size)}</a>
                                    </div>

                                    <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'flex-end', width: "100%" }}>
                                        <Button style={{ marginRight: 8 }} type='primary' onClick={async () => {
                                            await enableHPM(offHPM.fileName)
                                            forceUpdate()
                                        }}>启用</Button>
                                        <Button style={{ marginRight: 8 }} type="danger" onClick={async () => {
                                            await delHPM(offHPM.fileName)
                                            forceUpdate()
                                        }}>删除</Button>

                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </Collapse.Panel>
            </Collapse>

        </>
    )



};