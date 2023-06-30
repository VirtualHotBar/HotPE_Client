const nodeDiskInfo = require('node-disk-info'); //=> Use this when install as a dependency
//const nodeDiskInfo = require('./dist/index');


function diskInfo(){
// sync way
try {
    const disks = nodeDiskInfo.getDiskInfoSync();
    return disks;
} catch (e) {
    console.error(e);
}
}

//输出结果
/* for (const disk of disks) {
    console.log('Filesystem:', disk.filesystem);
    console.log('Blocks:', disk.blocks);
    console.log('Used:', disk.used);
    console.log('Available:', disk.available);
    console.log('Capacity:', disk.capacity);
    console.log('Mounted:', disk.mounted, '\n');
} */


export {diskInfo};