import { RunCmd } from './order';
//获取HotPE安装状态
export function GetHotPESetupState(){

}

//获取系统盘符
export function GetSysDrive(){
return(RunCmd(".\\resources\\tools\\HotPEAssembly.exe /GetSystemDriveLetter"))
}

//获取可移动盘符：wmic logicaldisk where drivetype=2 get deviceid
//获取本地盘符：wmic logicaldisk where drivetype=3 get deviceid
//获取所有盘符：wmic logicaldisk  get deviceid