import { getHardwareInfo } from "./hardwareInfo";

//用常量声明避免重复执行
export const SysLetter = getHardwareInfo('--sys').System['Windows Directory'].substr(0,2)
