import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import Main_window from './part/main_window';
import { RunCmd, WriteJosnFile, ParseJosnFile, ObjectCount } from './part/assembly/order';

let conf = ParseJosnFile("./resources/config.json")
conf.environment.BootMode = RunCmd(".\\resources\\tools\\HotPEAssembly.exe /GetBootMode")

if (ObjectCount(RunCmd("dir .\\resources\\files\\HotPE_*_*.7z.aria2 /B").split(" ")[0].replace("\r\n", "")) == 0) {
    conf.resources.HotPEResources.fileName = RunCmd("dir .\\resources\\files\\HotPE_*_*.7z /B").split(" ")[0].replace("\r\n", "")
} else {
    conf.resources.HotPEResources.fileName = ""
}
conf.environment.SystemDriveLetter = RunCmd(".\\resources\\tools\\HotPEAssembly.exe /GetSystemDriveLetter")
conf.environment.HotPEDriveLetter = RunCmd(".\\resources\\tools\\HotPEAssembly.exe /GetHotPEDriveLetter").split("|")
console.log(ObjectCount(conf.environment.HotPEDriveLetter))
conf.environment.DefaultHotPEDriveLetter = ""
WriteJosnFile("./resources/config.json", conf)


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <>
        <Main_window />
    </>

);



