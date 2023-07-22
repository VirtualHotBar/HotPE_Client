import { Notification } from '@douyinfe/semi-ui';
import { config, roConfig } from '../../services/config';
import { runCmdAsync } from '../../utils/command';
import { copyDir, copyFile, dealStrForCmd, delDir, isFileExisted, takeLeftStr, unZipFile } from '../../utils/utils';
import { checkIsReady } from './check';

const { shell, ipcRenderer } = require('electron')

const tempPathSource = roConfig.path.clientTemp + 'install\\SourceFiles\\'
const tempPathISO = roConfig.path.clientTemp + 'install\\ISOFile\\'

export async function makeISOFile(setStep: Function, setStepStr: Function,setLockMuen: Function) {
    if (!checkIsReady()) { return };// 检查是否准备就绪 

    let ISOSavePath = ipcRenderer.sendSync('file:getSavePath', roConfig.environment.desktopDir + 'HotPE-' + takeLeftStr(config.resources.pe.new, '.'))
    if (ISOSavePath == undefined) { return }

    setLockMuen(true)
    setStep(0)

    //当前操作是否成功
    let isSucceed = true

    //解压
    setStepStr('正在解压HotPE源')
    isSucceed = isSucceed && await unZipFile(roConfig.path.resources.pe + config.resources.pe.new, tempPathSource)

    setStepStr('正在复制HotPE文件')
    isSucceed = isSucceed && await copyDir(tempPathSource + 'EFI\\', tempPathISO)
    isSucceed = isSucceed && await copyDir(tempPathSource + 'Data\\', tempPathISO)

    setStepStr('正在生成ISO文件')
    await runCmdAsync(roConfig.path.tools + 'oscdimg\\oscdimg.exe -m -o -u2 -udfver102 -h -bootdata:2#p0,e,b' + dealStrForCmd(roConfig.path.tools + 'oscdimg\\Etfsboot.com') + '#pEF,e,b' + dealStrForCmd(roConfig.path.tools + 'oscdimg\\Efisys.bin') + ' -lHotPEToolBox ' + dealStrForCmd(tempPathISO) + ' ' + dealStrForCmd(ISOSavePath))

    isSucceed = isSucceed && await isFileExisted(ISOSavePath)



    //清理
    setStepStr('正在清理')
    await delDir(tempPathISO)
    await delDir(tempPathSource)

    if (isSucceed) {
        Notification.success({
            title: '镜像生成成功！',
            content: '已保存到:' + ISOSavePath,
            duration: 10,
        })
    } else {
        Notification.error({
            title: '镜像生成失败！',
            content: '请前往官网下载或重试。',
            duration: 10,
        })
    }

    setLockMuen(false)
    setStep(-1)
}