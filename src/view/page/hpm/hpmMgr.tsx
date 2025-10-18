import { Button, Collapse, List, Tag, Typography } from '@douyinfe/semi-ui';
import React, { useReducer } from 'react';
import { delHPM, disableHPM, enableHPM } from '../../controller/hpm/setHpm';
import { HPMListLocal } from '../../services/hpm';
import { formatSize } from '../../utils/utils';
import { HPM } from '../../type/hpm';

const { Text } = Typography;

// 创建通用的HPM列表项组件
const HPMListItem = ({ hpm, type, forceUpdate}: { hpm: HPM; type: 'on' | 'off'; forceUpdate: () => void }) => {

    const style = {
        border: '1px solid var(--semi-color-border)',
        backgroundColor: 'var(--semi-color-bg-2)',
        borderRadius: '3px',
        paddingLeft: '20px',
        margin: '8px 2px',
    };

    return (
        <List.Item style={style}>
            <div style={{ display: 'flex', width: "100%" }}>
                <div style={{ width: "calc(100% - 150px)" }}>
                    <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 600 }}>{hpm.name}</a>
                    {hpm.description&&hpm.description.includes('[PreInstall]')&&<> <Tag size='small' color='light-blue'>预装</Tag></>}
                    <br />
                    {type === 'on' ? (
                        <Text style={{ color: 'var(--semi-color-text-1)' }} ellipsis={{ showTooltip: true }}>
                            {`${hpm.version} | ${hpm.maker} | ${formatSize(hpm.size)}`}
                        </Text>
                    ) : (
                        <a style={{ color: 'var(--semi-color-text-1)' }}>
                            {hpm.version} | {hpm.maker} | {formatSize(hpm.size)}
                        </a>
                    )}
                </div>

                <div style={{ 
                    width: "150px", 
                    textAlign: 'right',
                    display: 'flex', 
                    justifyContent: 'flex-end' 
                }}>
                    {type === 'on' ? (
                        <>
                            <Button 
                                style={{ marginRight: 8 }} 
                                type='warning' 
                                onClick={async () => {
                                    await disableHPM(hpm.fileName);
                                    forceUpdate();
                                }}
                            >
                                禁用
                            </Button>
                            <Button 
                                style={{ marginRight: 8 }} 
                                type="danger" 
                                onClick={async () => {
                                    await delHPM(hpm.fileName);
                                    forceUpdate();
                                }}
                            >
                                删除
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                style={{ marginRight: 8 }} 
                                type='primary' 
                                onClick={async () => {
                                    await enableHPM(hpm.fileName);
                                    forceUpdate();
                                }}
                            >
                                启用
                            </Button>
                            <Button 
                                style={{ marginRight: 8 }} 
                                type="danger" 
                                onClick={async () => {
                                    await delHPM(hpm.fileName);
                                    forceUpdate();
                                }}
                            >
                                删除
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </List.Item>
    );
};

export default function HPMMgr() {
    const [, forceUpdate] = useReducer(x => x + 1, 0);


    return (
        <>
            <Collapse defaultActiveKey={['on', 'off']}>
                <Collapse.Panel header={"已启用："} itemKey="on" extra={HPMListLocal.on.length}>
                    <List
                        dataSource={HPMListLocal.on}
                        renderItem={onHPM => <HPMListItem hpm={onHPM} type="on" forceUpdate={forceUpdate} />}
                    />
                </Collapse.Panel>
                <Collapse.Panel header={"已禁用："} itemKey="off" extra={HPMListLocal.off.length}>
                    <List
                        dataSource={HPMListLocal.off}
                        renderItem={offHPM => <HPMListItem hpm={offHPM} type="off" forceUpdate={forceUpdate} />}
                    />
                </Collapse.Panel>
            </Collapse>
        </>
    );
}