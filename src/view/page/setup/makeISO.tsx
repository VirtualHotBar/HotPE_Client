import React, { useState } from 'react';
import {Aria2} from '../../utils/aria2/aria2.ts'
import { Button, Banner } from '@douyinfe/semi-ui';
import { Aria2Attrib } from '../../type/aria2';


const Aria2_ = new Aria2('.\\ClientTools\\aria2c.exe')

export default function MakeISO(){
    
    const [test,setTest] = useState ('')

    function test_(){
        
        setTimeout(()=>{Aria2_.start('https://github.com/VirtualHotBar/HotPEToolBox/releases/download/230430/HotPE-V2.5.230430.exe','D:\\','123.EXE',1,(Aria2Attrib_:Aria2Attrib)=>{
            setTest(Aria2Attrib_.state+' | '+Aria2Attrib_.speed+' | '+Aria2Attrib_.percentage+'% | '+Aria2Attrib_.size+' | '+Aria2Attrib_.newSize+' | '+Aria2Attrib_.remainder+' | '+Aria2Attrib_.message)
        })},1000);
        

    }
    
        return(
            <>
            😊
            <Button onClick={test_} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
            <Button onClick={()=>{Aria2_.stop((tepy:boolean)=>{console.log(tepy);
            })}} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
            <p>{test}</p>
            </>
        )
        

    
};