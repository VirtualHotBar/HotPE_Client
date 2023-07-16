import React, { useEffect, useState } from 'react';
import { Steps, Spin, Button } from '@douyinfe/semi-ui';
import { Windows, Delete,CheckOne } from '@icon-park/react';
import { config } from '../../services/config';
import { installToSystem } from '../../controller/Install/toSystem';

export default function SetupToSys() {

    useEffect(() => {


        if (config.state.setupToSys != 'without') {


            //检查更新
            if (config.state.setupToSys) {


            }
        }




    })


    return (
        <>{config.state.setupToSys == 'without'
            ? <div style={{ textAlign: "center", marginTop: "100px" }}>
                <Windows theme="outline" size="90" fill="var(--semi-color-text-0)" />
                <h2 >安装到系统</h2>
                <h3>将HotPE安装到本地的硬盘中，方便日常维护使用</h3>

                <Button onClick={() => { 
                    
                    installToSystem()
                    
                }} type='primary'>开始安装</Button>
            </div>
            : <div style={{ textAlign: "center", marginTop: "100px" }}>
                <CheckOne theme="outline" size="90" fill="var(--semi-color-text-0)" />
                <h2 >已安装到系统</h2>
                <h3>你已将HotPE安装到系统中，你可以进行卸载</h3>
                <Button onClick={() => { }} type='danger'>开始卸载</Button>
            </div>
        }
        </>
    )



};