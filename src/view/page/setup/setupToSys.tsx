import React, { useEffect, useState } from 'react';
import { Steps, Spin, Button } from '@douyinfe/semi-ui';
import { Windows, Delete, CheckOne } from '@icon-park/react';
import { config } from '../../services/config';
import { installToSystem, uninstallToSystem, updatePEForSys } from '../../controller/Install/toSystem';
import { getHardwareInfo } from '../../utils/hardwareInfo';
import { takeLeftStr } from '../../utils/utils';

export default function SetupToSys(props:any) {
    const [currentStep, setCurrentStep] = useState(-1)//当前步骤
    const [stepStr, setStepStr] = useState("")//步骤文本
    const [isUninstalling, setIsUninstalling] = useState(false)

    return (
        <>{currentStep == -1
            ? <>
                {config.state.setupToSys == 'without'
                    ? <div style={{ textAlign: "center", marginTop: "100px" }}>
                        <Windows theme="outline" size="90" fill="var(--semi-color-text-0)" />
                        <h2 >安装到系统</h2>
                        <h3>将HotPE安装到本地的硬盘中，方便日常维护使用</h3>

                        <Button onClick={() => {  installToSystem(setCurrentStep, setStepStr,props.setLockMuen) }} type='primary'>开始安装</Button>
                    </div>
                    : <>

                        {!isUninstalling
                            ? <div style={{ textAlign: "center", marginTop: "100px" }}>
                                <CheckOne theme="outline" size="90" fill="var(--semi-color-text-0)" />
                                <h2 >已安装到系统</h2>
                                <h3>你已将HotPE安装到系统中，你可以进行</h3>
                                {//更新按钮
                                    config.state.setupToSys < Number(takeLeftStr(config.resources.pe.new, '.')) ? <Button onClick={() => { updatePEForSys(setIsUninstalling, setCurrentStep, setStepStr,props.setLockMuen) }} type='primary' style={{ marginLeft: 8 }}>更新</Button> : <></>}
                                <Button onClick={() => { uninstallToSystem(setIsUninstalling,props.setLockMuen) }} type='danger'>卸载</Button>
                            </div>
                            : <div style={{ textAlign: "center", marginTop: "70px", width: "100%" }}>
                                <br /><br /><br /><br /><br /><br />

                                <Spin size="large" />
                                <h3>正在卸载...</h3>
                            </div>
                        }


                    </>
                }
            </>
            : <>
                <div style={{ display: 'flex', textAlign: "center", justifyContent: 'center', marginTop: "30px", width: "100%" }}>
                    <Steps style={{ width: "700px" }} size="small" current={currentStep}>
                        <Steps.Step title="解压" description="解压HotPE的相关文件" />
                        <Steps.Step title="复制" description="复制相关文件" />
                        <Steps.Step title="注册" description="添加启动选项" />
                    </Steps>
                </div>
                <div style={{ textAlign: "center", marginTop: "90px", width: "100%" }}>
                    <Spin size="large" />
                    <h3>{stepStr}</h3>
                </div>
            </>
        }
        </>
    )



};