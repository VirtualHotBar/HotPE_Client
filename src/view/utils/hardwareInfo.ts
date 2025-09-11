import { roConfig } from '../services/config';
import { runCmdAsync } from './command';
import { delFiles, isFileExisted } from './utils';
import { safeFS } from './safeAPI';

export function getHardwareInfo(parameter: string) {
  return new Promise(async resolve => {
    const outPath = `${roConfig.path.clientTemp + Math.random().toString(36).substring(2, 7)}.json`; //随机文件名

    const cmd = `${roConfig.path.tools}nwinfo\\nwinfo.exe  ${parameter} --format=json --output=${
      outPath
    }`;

    await runCmdAsync(cmd);

    let hwinfo = '';

    if (await isFileExisted(outPath)) {
      hwinfo = await safeFS.readFileSync(outPath);
      await delFiles(outPath);
    } else {
      hwinfo = '{}';
    }

    //console.log(hwinfo);
    //resolve(JSON.parse(hwinfo))//完成返回
    resolve(eval(`(${hwinfo})`)); //完成返回
  });
}
