import { config } from '../../services/config';
import { HPMListLocal } from '../../services/hpm';
import { HPM } from '../../../types/hpm';
import { getHPMinfoLocal } from './hpm';
import { isFileExisted, traverseFiles } from '@/view/utils/core/file';
import { takeLeftStr } from '@/view/utils/core/string';


//正在获取本地HPM列表
let isCheckingHPMFiles = false;

//获取本地HPM列表
export async function checkHPMFiles() {
  if (isCheckingHPMFiles || config.environment.HotPEDrive.new.letter == '') {
    return;
  } //如果正在获取或没有HotPE安装，就取消
  isCheckingHPMFiles = true;

  const HPMDirPath = `${config.environment.HotPEDrive.new.letter}\\HotPEModule\\`;

  let HPMsTemp = await traverseFiles(`${HPMDirPath}*.HPM`);
  const onHPMTemp = await Promise.all(
    HPMsTemp.map((fileName: string) => {
      return getHPMinfoLocal(HPMDirPath, fileName);
    })
  );

  //排除没有下载完成的
  for (const i in HPMListLocal.on) {
    if (
      HPMListLocal.on[i] &&
      (await isFileExisted(`${HPMDirPath + HPMListLocal.on[i]!.fileName}.aria2`))
    ) {
      //alert(HPMListLocal.on[1].fileName)
      HPMListLocal.on.splice(Number(i), 1);
    }
  }

  HPMsTemp = await traverseFiles(`${HPMDirPath}*.HPM.off`);
  const offHPMTemp = await Promise.all(
    HPMsTemp.map((fileName: string) => {
      return getHPMinfoLocal(HPMDirPath, fileName);
    })
  );

  HPMListLocal.on = onHPMTemp;
  HPMListLocal.off = offHPMTemp;
  console.log(HPMListLocal);

  isCheckingHPMFiles = false;
}

//HPM文件是否已存在(本地
export function isHPMHaveLocal(HPMInfo: HPM) {
  const HPMListLocalAll = HPMListLocal.on.concat(HPMListLocal.off); //合并

  for (const i in HPMListLocalAll) {
    if (
      HPMListLocalAll[i] &&
      takeLeftStr(HPMListLocalAll[i]!.fileName.toLowerCase(), '.hpm') ==
        takeLeftStr(HPMInfo.fileName.toLowerCase(), '.hpm')
    ) {
      return true;
    }
  }

  return false;
}
