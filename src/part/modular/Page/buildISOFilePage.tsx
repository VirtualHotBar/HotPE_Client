import React from 'react';
import { Cd } from '@icon-park/react';
import { Button } from '@douyinfe/semi-ui';

export default function BuildISOFilePage(){
    return(
        <>
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <Cd theme="outline" size="90" fill="var(--semi-color-text-0)" />
                <h2 >  生成ISO镜像</h2>

                <h3>生成HotPE的ISO镜像文件，用于刻录光盘或写入U盘</h3>
                <Button theme='solid' type='primary'>开始生成</Button>

            </div>

        </>
    )
}