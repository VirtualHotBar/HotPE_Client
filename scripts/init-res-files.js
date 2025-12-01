const fs = require('fs');
const path = require('path');

// 初始化资源文件
const dels = [
  'resources/files/pe/',
  'resources/files/client/',
  'resources/temp/',
  'resources/tools/PACMDforUSB/log/',
  'out/',
  '.vite/'
];

dels.forEach(del => {
  if (fs.existsSync(del)) {
    fs.rmSync(del, { recursive: true });
  }
});

