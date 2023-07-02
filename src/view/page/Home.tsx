import React, { useState } from 'react';
import { diskInfo } from '../utils/disk/diskInfo';
import { getHardwareInfo } from '../utils/hardwareInfo';
import { RunCmd_ } from '../utils/Command';
import { SysLetter } from '../utils/sysEnv';
import { Button } from '@douyinfe/semi-ui';







async function test(){
    console.log(SysLetter);


    new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log("First");
            resolve(0);
        }, 0);
    }).then(function () {
        return new Promise(function (resolve, reject) {
 
                console.log(getHardwareInfo('--disk'));
                
                
                console.log("Second");

        });
    }).then(function () {
        setTimeout(function () {
            console.log("Third");
        }, 0);
    });
    console.log('end');
}


export default function Home(){




/*     function printResults(disks:any) {

        console.log(`=========================\n`);

    
        for (const disk of disks) {
            console.log('Filesystem:', disk.filesystem);
            console.log('Blocks:', disk.blocks);
            console.log('Used:', disk.used);
            console.log('Available:', disk.available);
            console.log('Capacity:', disk.capacity);
            console.log('Mounted:', disk.mounted, '\n'); 

            
        }
    
    }
    



    printResults(diskInfo()); */



    
    
/* 
    RunCmd_("dir",(data:string)=>{console.log(data);
    },(error:number)=>{console.log(error);
    }) */

    
    









        return(
            <>
            <h2>欢迎使用HotPE客户端😊！</h2>
            <Button onClick={test}>主要按钮</Button>
            
            
            
            
            </>
        )
        

    
};