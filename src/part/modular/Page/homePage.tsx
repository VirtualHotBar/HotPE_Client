import React, { useState } from 'react';
import { Banner, Button, Progress, Notification, Modal, TreeSelect } from '@douyinfe/semi-ui';
import { IconSend } from '@douyinfe/semi-icons';
import { Help, EmotionHappy, EmotionUnhappy, CloseOne, DownloadOne } from '@icon-park/react';

import { RunCmd, RunCmd_, ParseJosnFile, ObjectCount, WriteJosnFile } from '../../assembly/order';

import BuildISOFilePage from '../Page/buildISOFilePage';
import HpmDownPage from '../Page/hpmDownPage';
import HpmManagePage from '../Page/hpmManagePage';
import SettingPage from '../Page/settingPage';
import SetupToUDiskPage from '../Page/setupToUDiskPage';
import SetupToSysPage from '../Page/setupToSysPage';

export default function Home(props: any) {
    let content = <></>//首页内容
    const [HotPEDownPercent, setHotPEDownPercent] = useState(-1)//下载百分百
    const [HotPEDownSpeed, setHotPEDownSpeed] = useState("OKB/S")//下载速度

    let noticeStr = '此版为开发预览版，并不代表最终的发布版，遇到Bug或有建议请反馈给开发者';
    let welcomeStr = '欢迎使用HotPE客户端😊！';
    let type: string = 'noDown';

    let conf = ParseJosnFile("./resources/config.json")

    //获取HotPE安装状态
    function GetHotPESetupState() {
        conf = ParseJosnFile("./resources/config.json")

        //console.log("conf.resources.HotPEResources.fileName",conf.resources.HotPEResources.fileName == "")
        if (conf.resources.HotPEResources.fileName == "") {
            type = 'noDown'
        }
        else if (ObjectCount(conf.environment.HotPEDriveLetter) == 0) {
            type = 'noSetup'
        }
        else if (ObjectCount(conf.environment.HotPEDriveLetter) != 0) {
            type = 'SetOK'

            //是否有多个HotPE的安装
            if (ObjectCount(conf.environment.HotPEDriveLetter) > 1) {
                //是否存在默认值
                if (conf.environment.DefaultHotPEDriveLetter == "") {
                    let i = 0
                    let treeData = conf.environment.HotPEDriveLetter.map(function (data: string) {
                        return { label: data, value: data, key: i++ }
                    })
                    console.log(treeData)
                    //取最后的盘符作为默认值
                    conf.environment.DefaultHotPEDriveLetter = conf.environment.HotPEDriveLetter[ObjectCount(conf.environment.HotPEDriveLetter) - 1]
                    WriteJosnFile("./resources/config.json", conf)
                    //选择窗口
                    Modal.info(
                        {
                            'title': '检测到安装了多个HotPE',
                            'content': <>
                                <h4>请选择要更改的HotPE所在盘符：</h4>
                                <TreeSelect
                                    defaultValue={conf.environment.DefaultHotPEDriveLetter}
                                    style={{ width: 300 }}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    treeData={treeData}
                                    onSelect={(value: string) => {
                                        conf.environment.DefaultHotPEDriveLetter = conf.environment.HotPEDriveLetter[Number(value)]
                                        WriteJosnFile("./resources/config.json", conf)
                                    }} /></>,
                            icon: <IconSend />,
                            cancelButtonProps: { theme: 'borderless' },
                            okButtonProps: { theme: 'solid' },
                            hasCancel: false
                        }
                    );
                }

            } else {
                conf.environment.DefaultHotPEDriveLetter = conf.environment.HotPEDriveLetter[ObjectCount(conf.environment.HotPEDriveLetter) - 1]
                WriteJosnFile("./resources/config.json", conf)
            }


        } else {
            type = 'unknown'
        }


    }
    GetHotPESetupState();

    //下载HotPE文件
    function DownHotPE() {
        props.SetLockMuen("Home")
        //setHotPEDownPercent(90)
        setHotPEDownPercent(0)
        var request = window.require('request');

        request({ url: 'https://clientapi-cf.hotpe.top/client/get/resourcesURL', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.77' } },
            (error: number, response: any, body: any) => {
                console.log(error, response.statusCode)
                if (!error && response.statusCode == 200) {
                    console.log(body)
                    console.log(JSON.parse(body).url)


                    //[#a986d2 127MiB/617MiB(20%) CN:1 DL:2.6MiB ETA:3m2s]
                    RunCmd_(".\\resources\\tools\\aria2c.exe " + JSON.parse(body).url + " -d resources\\files\\ -o HotPE_2.5_220920.7z",
                        function (str: string) {
                            console.log(str)
                            if (str.includes("ETA")) {//即时返回
                                setHotPEDownPercent(Number(str.substring(str.indexOf("B(") + 2, str.indexOf("%)"))))
                                setHotPEDownSpeed('正在下载：' + str.substring(str.indexOf("DL:") + 3, str.indexOf("iB ETA")) + 'B/S')
                            } else {
                                setHotPEDownSpeed("正在请求文件，若长时间静止请重启客户端")
                            }
                        },
                        function (num: number) {//结束返回
                            setHotPEDownPercent(-1)

                            if (num === 0) {
                                conf.resources.HotPEResources.fileName = RunCmd("dir .\\resources\\files\\HotPE_*_*.7z /B").split(" ")[0].replace("\r\n", "")
                                WriteJosnFile("./resources/config.json", conf)
                                Notification.success({
                                    title: '依赖下载完成！',
                                    content: '你可以继续使用。',
                                    duration: 5,
                                    theme: 'light',
                                })
                                GetHotPESetupState();
                            } else {
                                Notification.error({
                                    title: '依赖下载失败！',
                                    content: '请检查网络重试。',
                                    duration: 10,
                                    theme: 'light',
                                })
                            }
                            props.SetLockMuen("")
                        })
                }else{
                    Notification.error({
                        title: '依赖下载失败！',
                        content: '请检查网络重试。',
                        duration: 10,
                        theme: 'light',
                    })
                    props.SetLockMuen("")
                    setHotPEDownPercent(-1)
                }
            });










    }


    //不同安装状态的页面
    if (type == "noSetup") {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            <div ><Help theme="outline" size="90" fill="#4a90e2" /></div>
            <h3>现在并未检测到有HotPE的安装,请插入已安装的U盘或开始安装</h3>
            <Button onClick={() => props.SetMenuAndPage(<SetupToSysPage />, 'SetupToSys')} type='primary' style={{ marginRight: 8 }}>安装到系统</Button>
            <Button onClick={() => { props.SetMenuAndPage(<SetupToUDiskPage />, 'SetupToUDisk') }} type='primary' style={{ marginRight: 8 }}>安装到U盘</Button>
            <Button onClick={() => { props.SetMenuAndPage(<BuildISOFilePage />, 'BuildISOFile') }} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
        </div>
    } else if (type == "SetOK") {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            <div ><EmotionHappy theme="outline" size="90" fill="#4a90e2" /></div>
            <h3>你的HotPE已准备就绪,你可以进行更改</h3>
            <Button onClick={() => { props.SetMenuAndPage(<HpmDownPage />, 'HpmDown') }} type='primary' style={{ marginRight: 8 }}>模块下载</Button>
            <Button onClick={() => { props.SetMenuAndPage(<HpmManagePage />, 'HpmManage') }} type='primary' style={{ marginRight: 8 }}>模块管理</Button>
            <Button onClick={() => { props.SetMenuAndPage(<SettingPage />, 'Setting') }} type='primary' style={{ marginRight: 8 }}>PE设置</Button>
        </div>
    } else if (type == 'noDown') {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            {HotPEDownPercent === -1 ? <>
                <div ><EmotionUnhappy theme="outline" size="90" fill="#4a90e2" /></div>
                <h3>未检测到HotPE的相关文件,需要下载,以便安装</h3>
                <Button type='primary' style={{ marginRight: 8 }} onClick={DownHotPE}>开始下载</Button></>
                : <><div ><DownloadOne theme="outline" size="90" fill="#4a90e2" /></div>
                    <h3>{HotPEDownSpeed}</h3>
                    <Progress style={{ margin: "0px 100px 0px 100px" }} percent={HotPEDownPercent} showInfo aria-label="disk usage" size="small" />
                </>
            }
        </div>
    }
    else {
        content = <>
            <div style={{ textAlign: "center", width: "100%", marginTop: "100px" }}>
                <div ><CloseOne theme="outline" size="90" fill="#FF1F1D" /></div>
                <h2>安装检测出错!</h2><h3>未检测出HotPE的安装状态或文件下载状态，请向开发者反馈</h3></div>
        </>
    }


    //返回的界面
    return (
        <>
            <div style={{ margin: "20px" }}>
                {welcomeStr === '' ? <></> : <h2>{welcomeStr}</h2>}
                {noticeStr === '' ? <></> : <Banner description={noticeStr} type="info" />}
            </div>
            {content}
        </>
    )


}



