const fs = require('fs');
const path = require('path');

const dels = [
  'resources/files/pe/',
  'resources/files/client/',
  'resources/temp/',
  'resources/tools/PACMDforUSB/log/',
  '.vite/'
];

dels.forEach(del => {
  if (fs.existsSync(del)) {
    fs.rmSync(del, { recursive: true });
  }
});

