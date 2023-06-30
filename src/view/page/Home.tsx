import React, { useState } from 'react';
import { diskInfo } from '../utils/disk/diskInfo';
import { getHardwareInfo } from '../utils/hardwareInfo';


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



    
    console.log(getHardwareInfo());
    










        return(
            <>
            <h2>欢迎使用HotPE客户端😊！</h2>
            
            
            
            </>
        )
        

    
};