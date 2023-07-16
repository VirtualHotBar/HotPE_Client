import { config, roConfig } from "../../services/config";
import {isFileExisted,  unZipFile } from "../../utils/utils";
//import fs from "fs";

const fs = window.require('fs')

export async function installToSystem() {

    let tempPath = roConfig.path.clientTemp + 'install\\peFiles\\'

    //创建临时目录
    if(await isFileExisted(tempPath) ==false){
        fs.mkdir(tempPath,(back:any)=>{console.log(back)})
    }

    //解压
    //unZipFile(roConfig.path.resources.pe + config.resources.pe.new, tempPath)




}