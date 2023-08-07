import { Button, Spin, Steps, TreeSelect } from '@douyinfe/semi-ui';
import { UsbMemoryStick } from '@icon-park/react';
import React, { useState, useReducer, useEffect } from 'react';
import { config } from '../../services/config';
import { takeLeftStr} from '../../utils/utils';
import { IconRefresh } from '@douyinfe/semi-icons';
import { UnInstallToUDisk, installToUDisk, updatePEForUDisk } from '../../controller/Install/toUDisk';
import { checkPEDrive } from '../../controller/condition';
import { getHotPEDriveVer } from '../../controller/Install/check';


//let uDiskRefreshing =false


async function UDiskRefres(steUDiskRefreshing: Function, setLockMuen: Function) {
    steUDiskRefreshing(true)
    setLockMuen(true)

    //更新PE安装
    await checkPEDrive()//getdiskinfo()

    console.log(config.environment.ware.disks);

    steUDiskRefreshing(false)
    setLockMuen(false)
}

export default function SetupToUDisk(props: any) {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新页面
    const [uDiskRefreshing, steUDiskRefreshing] = useState(false)

    const [step, setStep] = useState(-1)//步骤   -1:无操作，-2：加载(还原)
    const [stepStr, setStepStr] = useState(-1)//步骤文本

    //选择的U盘索引
    let temp = ''

    let driveDataTemp: Array<any> = []
    for (let i in config.environment.ware.disks) {
        const disk = config.environment.ware.disks[i]

        let letter: Array<string> = []
        for (let i in config.environment.ware.partitions) {
            const partition = config.environment.ware.partitions[i]
            if (partition.letter != '' && partition.diskIndex == disk.index) {
                letter.push(partition.letter)
            }
        }

        const label = disk.index + ':' + disk.name + '(' + disk.size + ',' + letter.toString() + ')'

        if (disk.movable) {//可移动
            driveDataTemp.push({ label: label, value: disk.index, key: i })
        }
    }
    /*     if (driveDataTemp.length > 0) {
            temp = driveDataTemp[0].value.toString()
        } */

    const [selectUDiskIndex, setSelectUDiskIndex] = useState(temp)
    const [selectPEVersion, setSelectPEVersion] = useState(getHotPEDriveVer(Number(selectUDiskIndex)))//选择的U盘是PEu盘的版本，为空不是HotPEu盘

    console.log(selectUDiskIndex, selectPEVersion);

    useEffect(() => {
        if (selectUDiskIndex == '' && driveDataTemp.length > 0) {
            setSelectUDiskIndex(driveDataTemp[0].value.toString())
        }

        if (getHotPEDriveVer(Number(selectUDiskIndex)) != selectPEVersion) {
            setSelectPEVersion(getHotPEDriveVer(Number(selectUDiskIndex)))
        }

        if (driveDataTemp.length == 0) {
            setSelectUDiskIndex('')
        }
    })

    return (
        <>{step == -1//未操作，默认页面
            ? <div style={{ textAlign: "center", marginTop: "100px" }}>
                <UsbMemoryStick theme="outline" size="90" fill="var( --semi-color-secondary)" />
                <h2 >  安装到U盘</h2>
                <h3 style={{ color: 'var(--semi-color-text-1)' }}>将HotPE安装到U盘中，随身携带</h3>
                <TreeSelect
                    placeholder={'请插入U盘'}
                    //defaultValue={[]}
                    value={[selectUDiskIndex]}
                    style={{ width: '400px' }}
                    dropdownStyle={{ overflow: 'auto' }}
                    treeData={driveDataTemp}
                    disabled={uDiskRefreshing}
                    onChange={(value: any) => {
                        setSelectPEVersion(getHotPEDriveVer(Number(value)))
                        setSelectUDiskIndex(value)
                        console.log(value, selectPEVersion);
                    }} />

                {!uDiskRefreshing ? <Button type="primary" icon={<IconRefresh />} style={{ marginLeft: 8, marginTop: -4 }} aria-label="刷新" onClick={async () => { await UDiskRefres(steUDiskRefreshing, props.setLockMuen); }} /> : <Spin size="middle" />}
                <br /><br />
                {selectUDiskIndex != '' ?//操作按钮
                    <>{selectPEVersion == '' ? <Button theme='solid' type='primary' disabled={uDiskRefreshing} onClick={() => {
                        if (selectUDiskIndex != '') { installToUDisk(selectUDiskIndex, setStep, setStepStr, props.setLockMuen) }
                        console.log(selectPEVersion, selectUDiskIndex, selectPEVersion);
                    }}>开始安装</Button> : <>
                        {/* 更新按钮，更新判断 */Number(selectPEVersion) < Number(takeLeftStr(config.resources.pe.new, '.')) ? <Button type='primary' disabled={uDiskRefreshing} onClick={() => { updatePEForUDisk(selectUDiskIndex, setStep, setStepStr, props.setLockMuen) }}>免格更新</Button> : <></>}
                        <Button disabled={uDiskRefreshing} style={{ marginLeft: 8 }} onClick={() => { UnInstallToUDisk(selectUDiskIndex, setStep, setStepStr, props.setLockMuen) }} type='danger'>还原U盘</Button>
                    </>}</> : <></>}

            </div>
            //安装 or 更新
            : step > -1
                ? <><div style={{ display: 'flex', textAlign: "center", justifyContent: 'center', marginTop: "30px", width: "100%" }}>
                    <Steps style={{ width: "700px" }} size="small" current={step}>
                        <Steps.Step title="解压" description="解压HotPE的相关文件" />
                        <Steps.Step title="制作" description="分区并写入文件和引导" />
                        <Steps.Step title="清理" description="清理临时文件" />
                    </Steps>
                </div>
                    <div style={{ textAlign: "center", marginTop: "90px", width: "100%" }}>
                        <Spin size="large" />
                        <h3>{stepStr}</h3>
                    </div>
                </>

                //加载(还原)
                : step == -2 ? <>
                    <div style={{ textAlign: "center", marginTop: "190px", width: "100%" }}>
                        <Spin size="large" />
                        <h3>{stepStr}</h3>
                    </div>
                </> : <></>

        }



        </>
    )



};