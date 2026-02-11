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

    if (!fs.existsSync(sevenZipExe)) {
      throw new Error(`7z not found: ${sevenZipExe}`);
    }
    if (!fs.existsSync(outDir)) {
      throw new Error(`Output directory not found: ${outDir}`);
    }

    // 查找源目录
    const prefix = (packageJSON.name || 'HotPE_Client').replace(/n$/, '');
    const allDirs = fs.readdirSync(outDir).filter(f => {
      try { return fs.statSync(path.join(outDir, f)).isDirectory(); } catch { return false; }
    });

    const findDir = () =>
      allDirs.find(f => f.startsWith(prefix) && f.includes(targetPlatform) && f.includes(targetArch)) ||
      allDirs.find(f => f.startsWith(prefix) && f.includes(targetPlatform)) ||
      allDirs.find(f => f.includes(targetPlatform)) ||
      allDirs.find(f => !f.startsWith('.') && f !== 'make' && f !== appName);

    const actualSourceDir = findDir();
    if (!actualSourceDir) {
      throw new Error(`Source directory not found for ${targetPlatform}-${targetArch}`);
    }
    console.log('Source directory:', actualSourceDir);

    // 切换到out目录处理
    const oldCwd = process.cwd();
    process.chdir(outDir);

    try {
      // 重命名为统一名称
      if (actualSourceDir !== appName) {
        console.log(`Renaming ${actualSourceDir} -> ${appName}`);
        if (fs.existsSync(appName)) fs.rmSync(appName, { recursive: true });
        fs.renameSync(actualSourceDir, appName);
      }

      // 打包
      const archive = `${appName}.7z`;
      execSync(`"${sevenZipExe}" a -t7z -mx=9 "${archive}" "./${appName}"`, { stdio: 'inherit' });

      return [path.join(outDir, archive)];
    } finally {
      process.chdir(oldCwd);
    }
  }

  isSupportedOnCurrentPlatform() {
    return process.platform === 'win32';
  }

  getPlatforms() {
    return this.platforms;
  }

  clone(config) {
    return new Maker7z({ ...this.config, ...config });
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

  get requiredMethods() {
    return ['make', 'isSupportedOnCurrentPlatform', 'checkSystemPrerequisites', 'ensureExternalBinariesExist'];
  }
}

module.exports = Maker7z;
