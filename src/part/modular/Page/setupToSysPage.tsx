import React, { useState } from 'react';
import { Windows,Delete } from '@icon-park/react';
import { Button, Steps, Spin, Progress, Notification } from '@douyinfe/semi-ui';
import { RunCmd, RunCmd_, ParseJosnFile, ObjectCount, WriteJosnFile } from '../../assembly/order';

export default function SetupToSysPage(props: any) {
    const [currentStep, setCurrentStep] = useState(-1)
    const [stepStr, setStepStr] = useState("")

    //WriteJosnFile("./resources/config.json", conf)
    let isSetup_ = false//已安装
    function GetIsSetup(){    
        let conf = ParseJosnFile("./resources/config.json")
        for (var i = 0; i < ObjectCount(conf.environment.HotPEDriveLetter); i++) {//判断是否安装
        if (conf.environment.HotPEDriveLetter[i] == conf.environment.SystemDriveLetter) {
            isSetup_ = true;
        }
    }}
    GetIsSetup()

    const [isSetup, setIsSetup] = useState(isSetup_)


    function SetupToSys() {
        let conf = ParseJosnFile("./resources/config.json")
        props.SetLockMuen("SetupToSys")
        setCurrentStep(0)

        setStepStr('正在解压HotPE相关文件')
        //清理过期的临时目录
        RunCmd("rd .\\resources\\files\\tempResources /s /q")
        //创建临时目录
        RunCmd("MKDIR .\\resources\\files\\tempResources")
        //解压
        RunCmd_(
            ".\\resources\\tools\\7z.exe x .\\resources\\files\\" + conf.resources.HotPEResources.fileName + " -o.\\resources\\files\\tempResources",
            function (str: string) {//即时返回
                console.log(str)
            },
            function (num: number) {//结束返回
                if (num == 0) {
                    startSetupToSys()
                } else {
                    Notification.error({
                        title: '解压文件失败！',
                        content: '请重新下载或检查权限重试。',
                        duration: 4,
                        theme: 'light',
                    })
                    props.SetLockMuen("")
                    setCurrentStep(-1)
                    return
                }
            }
        )

        //安装
        function startSetupToSys() {
            RunCmd_(".\\resources\\tools\\HotPEAssembly.exe /SetupHotPEToSys " + process.cwd() + "\\resources\\files\\tempResources\\HotPEISO",
                (str: string) => {//即时返回
                    /* Step:[CopyFiles]
                    Step:[AddBoot]
                    Info:[Success] */
                    if (str.includes("Step")) {
                        if (str.includes("CopyFiles")) {
                            setStepStr('正在复制HotPE相关文件')
                            setCurrentStep(1)//步骤：复制文件
                        } else if (str.includes("AddBoot")) {
                            setCurrentStep(2)//添加引导
                            setStepStr('正在添加HotPE的引导')
                        }
                    }

                    if (str.includes("Success")) {
                        setCurrentStep(-1)
                        props.SetLockMuen("")
                        setIsSetup(true)



                        Notification.success({
                            title: '安装到系统完成！',
                            content: '每次重启都有3S的等待时间。',
                            duration: 5,
                            theme: 'light',
                        })
                    }
                },
                (num: number) => {//结束返回
                    conf = ParseJosnFile("./resources/config.json")
                    conf.environment.HotPEDriveLetter = RunCmd(".\\resources\\tools\\HotPEAssembly.exe /GetHotPEDriveLetter").split("|")
                    conf.environment.DefaultHotPEDriveLetter = ""
                    WriteJosnFile("./resources/config.json", conf)

                    console.log(num)
                    setCurrentStep(-1)
                    props.SetLockMuen("")
                })
        }
        //props.SetLockMuen("")
        //setCurrentStep(-1)
    };

    function UnSetup(){
        let conf = ParseJosnFile("./resources/config.json")
        RunCmd_(".\\resources\\tools\\HotPEAssembly.exe /UnSetupHotPEToSys " ,
        (str: string) => {//即时返回
            if (str.includes("Success")) {
                setIsSetup(false)
                
                conf = ParseJosnFile("./resources/config.json")
                conf.environment.HotPEDriveLetter = RunCmd(".\\resources\\tools\\HotPEAssembly.exe /GetHotPEDriveLetter").split("|")
                conf.environment.DefaultHotPEDriveLetter = ""
                WriteJosnFile("./resources/config.json", conf)

                Notification.success({
                    title: '卸载成功！',
                    content: 'emmm，期待你的回来。',
                    duration: 5,
                    theme: 'light',
                })
            }
        },(num: number) => {//结束返回

        })
    };


    return (
        <>
            {
                currentStep == -1 ? <>
                    {isSetup == false ?
                        <div style={{ textAlign: "center", marginTop: "100px" }}>
                            <Windows theme="outline" size="90" fill="var(--semi-color-text-0)" />
                            <h2 >  安装到系统</h2>
                            <h3>将HotPE安装到本地的硬盘中，方便日常维护使用</h3>
                            <Button onClick={() => { SetupToSys() }} theme='solid' type='primary'>开始安装</Button>
                        </div> :
                        <div style={{ textAlign: "center", marginTop: "100px" }}>
                            <Delete theme="outline" size="90" fill="#FF3373" />
                            <h2 >从系统中卸载</h2>
                            <h3>你已将HotPE安装到系统中，你可以进行卸载</h3>
                            <Button onClick={() => { UnSetup() }} theme='solid' type='danger'>开始卸载</Button>
                        </div>}
                </>
                    :
                    <>
                        <div style={{ display: 'flex', textAlign: "center", justifyContent: 'center', marginTop: "30px", width: "100%" }}>
                            <Steps style={{ width: "700px" }} size="small" current={currentStep}>
                                <Steps.Step title="解压" description="解压HotPE的相关文件" />
                                <Steps.Step title="复制" description="复制相关文件" />
                                <Steps.Step title="注册" description="添加启动选项" />
                            </Steps>
                        </div>
                        <div style={{ textAlign: "center", marginTop: "70px", width: "100%" }}>
                            <Spin size="large" />
                            <h3>{stepStr}</h3>
                        </div>
                    </>
            }
        </>
    )
}

