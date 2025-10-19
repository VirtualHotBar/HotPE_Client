const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Maker7z {
  constructor(config = {}) {
    this.name = '@electron-forge/maker-7z';
    this.config = {
      sevenZipPath: path.join(process.cwd(), 'resources', 'tools', '7z', '7z.exe'),
      ...config
    };
    this.platforms = ['win32'];
  }

  async make(options) {
    const { makeDir, targetPlatform, targetArch, packageJSON } = options;
    
    const outDir = path.dirname(makeDir);
    const appName = 'HotPE_Client';
    const sevenZipExe = this.config.sevenZipPath;
    
    // 检查7z工具是否存在
    if (!fs.existsSync(sevenZipExe)) {
      throw new Error(`7z executable not found at path: ${sevenZipExe}`);
    }
    
    // 查找源目录
    const allDirs = fs.readdirSync(outDir).filter(f => 
      fs.statSync(path.join(outDir, f)).isDirectory()
    );
    
    // 精简目录查找逻辑
    let actualSourceDir = allDirs.find(f => 
      f.startsWith(packageJSON.name) && f.includes(targetPlatform)
    ) || allDirs.find(f => f.includes(targetPlatform));
    
    if (!actualSourceDir) {
      actualSourceDir = allDirs.find(f => !f.startsWith('.') && f !== 'make' && f !== appName);
    }
    
    if (!actualSourceDir) {
      throw new Error(`Source directory not found for ${targetPlatform}-${targetArch}`);
    }
    
    try {
      // 切换到out目录
      const oldCwd = process.cwd();
      process.chdir(outDir);
      
      // 重命名文件夹为统一名称
      if (actualSourceDir !== appName) {
        if (fs.existsSync(appName)) {
          fs.rmSync(appName, { recursive: true });
        }
        fs.renameSync(actualSourceDir, appName);
      }
      
      // 检查目录是否存在
      if (!fs.existsSync(appName)) {
        throw new Error(`${appName} directory not found`);
      }
      
      // 执行7z压缩命令
      const command = `"${sevenZipExe}" a -t7z -mx=9 "${appName}.7z" -ir!${appName} "${appName}\\*"`;
      execSync(command, { stdio: 'inherit' });
      
      // 恢复工作目录
      process.chdir(oldCwd);
      
      return [path.join(outDir, `${appName}.7z`)];
    } catch (error) {
      throw new Error(`7z compression failed: ${error.message}`);
    }
  }

  isSupportedOnCurrentPlatform() {
    return process.platform === 'win32';
  }
  
  async checkSystemPrerequisites() {
    return true;
  }
  
  async ensureExternalBinariesExist() {
    return true;
  }
  
  getDefaultConfig() {
    return {};
  }
  
  prepareConfig(targetArch) {
    return this.config;
  }
  
  getRequiredExternalBinaries() {
    return [];
  }
  
  async resolveForgeConfig(forgeConfig) {
    return forgeConfig;
  }
  
  getPlatforms() {
    return this.platforms;
  }
}

module.exports = Maker7z;