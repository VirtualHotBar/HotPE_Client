const child_process = window.require('child_process')
const iconv = window.require('iconv-lite');

//获取系统默认编码
function getEncoding(): string {
  const codePageEncodings: { [key: string]: string } = {
    '65001': 'UTF-8',
    '936': 'GBK',
    '932': 'Shift_JIS',
    '949': 'KS_C_5601-1987',
    '950': 'Big5',
    '1200': 'UTF-16LE',
    '1201': 'UTF-16BE',
    '1250': 'Windows-1250',
    '1251': 'Windows-1251',
    '1252': 'Windows-1252',
  };

  try {
    const output = child_process.execSync('chcp').toString();
    const match = output.match(/:\s+(\d+)/);
    if (match && match[1]) {
      const codePage = match[1];
      return codePageEncodings[codePage] || 'Unknown encoding';
    }
    return 'Unknown encoding';
  } catch (e) {
    // 适当处理错误
    console.error(e);
    return 'Error fetching encoding';
  }
}
const encoding = getEncoding();

// 同步执行命令行
export function runCmdSync(cmd: string) {
  return iconv.decode(child_process.execSync(cmd), encoding);
}

// 异步执行命令行，并通过回调返回结果
export function runCmd(cmd: string, returnstr: (data: string) => void, end: (code: number) => void) {
  const encoding = getEncoding();
  const result = child_process.spawn('cmd.exe', ['/c', cmd]);

  result.stdout.on("data", (data: Buffer) => {
    returnstr(iconv.decode(data, encoding));
  });

  result.on("exit", (code: number) => {
    console.info(`${code} Command: ${cmd}`)
    end(code);
  });

  result.stderr.on("data", (data: Buffer) => {
    console.error(iconv.decode(data, encoding));
  });
}

// 异步执行命令行，并通过 Promise 返回结果
export function runCmdAsync(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    let returnStr: string = '';
    runCmd(cmd, (back: string) => {
      returnStr += back;
      console.log(returnStr);
      
    }, (code: number) => {
      if (code === 0) {
        resolve(returnStr);
      } else {
        resolve(returnStr);
        
        reject(new Error(`命令执行失败：${cmd},错误码: ${code}`));
      }
    });
  });
}