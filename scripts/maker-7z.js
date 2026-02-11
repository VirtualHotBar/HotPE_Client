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
    const { makeDir, targetPlatform, targetArch, packageJSON, appName } = options;
    
    const outDir = path.dirname(makeDir);
    const sevenZipExe = this.config.sevenZipPath;
    
    // 检查7z工具是否存在
    if (!fs.existsSync(sevenZipExe)) {
      throw new Error(`7z executable not found at path: ${sevenZipExe}`);
    }
    
    // 查找源目录
    if (!fs.existsSync(outDir)) {
      throw new Error(`Output directory does not exist: ${outDir}`);
    }
    
    const allDirs = fs.readdirSync(outDir).filter(f => {
      try {
        return fs.statSync(path.join(outDir, f)).isDirectory();
      } catch (err) {
        return false;
      }
    });
    
    console.log('Found directories:', allDirs);
    console.log('Looking for app with name:', packageJSON.name);
    
    // 优化目录查找逻辑
    let actualSourceDir = allDirs.find(f => 
      f.startsWith((packageJSON.name || 'HotPE_Client').replace(/n$/, '')) && f.includes(targetPlatform) && f.includes(targetArch)
    );
    
    if (!actualSourceDir) {
      actualSourceDir = allDirs.find(f => 
        f.startsWith((packageJSON.name || 'HotPE_Client').replace(/n$/, '')) && f.includes(targetPlatform)
      );
    }
    
    if (!actualSourceDir) {
      actualSourceDir = allDirs.find(f => f.includes(targetPlatform));
    }
    
    if (!actualSourceDir) {
      actualSourceDir = allDirs.find(f => !f.startsWith('.') && f !== 'make' && f !== appName);
    }
    
    if (!actualSourceDir) {
      throw new Error(`Source directory not found for ${targetPlatform}-${targetArch}. Found directories: [${allDirs.join(', ')}]`);
    }
    
    console.log('Found source directory:', actualSourceDir);
    
    try {
      // 切换到out目录
      const oldCwd = process.cwd();
      process.chdir(outDir);
      
      // 重命名文件夹为统一名称
      if (actualSourceDir !== appName) {
        console.log(`Renaming ${actualSourceDir} to ${appName}`);
        if (fs.existsSync(appName)) {
          fs.rmSync(appName, { recursive: true });
        }
        fs.renameSync(actualSourceDir, appName);
      }
      
      // 检查目录是否存在
      if (!fs.existsSync(appName)) {
        throw new Error(`${appName} directory not found`);
      }
      
      // 创建快捷方式（使用相对路径，便于用户移动文件夹后仍能使用）
      const exePath = path.join(outDir, appName, `${appName}.exe`);
      const shortcutPath = path.join(outDir, appName, `${appName}.lnk`);
      
      if (fs.existsSync(exePath)) {
        console.log(`Creating shortcut: ${shortcutPath}`);
        // 使用相对路径，这样无论解压到哪个位置，快捷方式都能正常工作
        const psCommand = `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('${shortcutPath}'); $s.TargetPath = '${appName}.exe'; $s.WorkingDirectory = '.'; $s.Save()`;
        execSync(`powershell.exe -Command "${psCommand}"`, { stdio: 'inherit' });
      }
      
      // 执行7z压缩命令
      const command = `"${sevenZipExe}" a -t7z -mx=9 "${appName}.7z" "./${appName}"`;
      console.log(`Executing 7z command: ${command}`);
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
  
  // 添加新的 requiredMethods 方法以适配新版本 Electron Forge
  get requiredMethods() {
    return ['make', 'isSupportedOnCurrentPlatform', 'checkSystemPrerequisites', 'ensureExternalBinariesExist'];
  }
  
  // 添加 clone 方法以适配新版本 Electron Forge
  clone(config) {
    return new Maker7z({ ...this.config, ...config });
  }
}

module.exports = Maker7z;