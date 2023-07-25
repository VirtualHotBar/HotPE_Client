import React, { useState } from 'react';
import { Button, Banner, Spin } from '@douyinfe/semi-ui';
import { Cd } from '@icon-park/react';

import { makeISOFile } from '../../controller/Install/makeISO';

export default function MakeISO(props:any) {
    const [step, setStep] = useState(-1)//步骤   -1:无操作，>-1:正在操作
    const [stepStr, setStepStr] = useState(-1)//步骤文本





    return (
        <>{step == -1
            ? <div style={{ textAlign: "center", marginTop: "100px" }}>
                <Cd theme="outline" size="90" fill="var( --semi-color-secondary)" />
                <h2 >  生成ISO镜像</h2>

                <h3 style={{color:'var(--semi-color-text-1)'}}>生成HotPE的ISO镜像文件，用于刻录光盘或写入U盘</h3>
                <Button type='primary' onClick={()=>{makeISOFile(setStep,setStepStr,props.setLockMuen)}}>开始生成</Button>

            </div>
            : <div style={{ textAlign: "center", marginTop: "190px", width: "100%" }}>
                <Spin size="large" />
                <h3>{stepStr}</h3>
            </div>}
        </>
    )



};