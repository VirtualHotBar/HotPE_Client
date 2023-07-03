import React, { useState } from 'react';
import {Aria2} from '../../utils/aria2/aria2.ts'
import { Button, Banner } from '@douyinfe/semi-ui';



export default function MakeISO(){

    function test(){
        const Aria2_ = new Aria2('.\\ClientTools\\aria2c.exe')

    }
    
        return(
            <>
            😊
            <Button onClick={test} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
            </>
        )
        

    
};