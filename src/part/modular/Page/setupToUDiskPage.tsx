import React from 'react';
import { UsbMemoryStick } from '@icon-park/react';
import { Button } from '@douyinfe/semi-ui';

export default function SetupToUDiskPage() {
    return (
        <>
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <UsbMemoryStick theme="outline" size="90" fill="var(--semi-color-text-0)" />
                <h2 >  安装到U盘</h2>

                <h3>将HotPE安装到U盘中，随身携带，请插入你的U盘</h3>
                <Button theme='solid' type='primary'>开始安装</Button>

            </div>

        </>
    )
}