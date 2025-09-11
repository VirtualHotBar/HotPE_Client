/**
 * 统一配置管理服务
 * 合并了原有的 config.ts 和 config-manager.ts 功能
 */

import { Config } from '../../types/config';
import { safeFS } from '../utils/safeAPI';
import { isJSON, writeJosnFile } from '../utils/utils';
import { runCmdAsync } from '../utils/command';

// 只读配置类型
interface ReadOnlyConfig {
  readonly id: string;
  readonly clientVer: string;
  readonly url: {
    readonly home: string;
    readonly github: string;
    readonly docs: string;
    readonly blog: string;
    readonly donate: string;
    readonly update: string;
    readonly package: Record<string, never>;
  };
  readonly path: {
    execDir: string;
    readonly tools: string;
    readonly clientTemp: string;
    readonly resources: {
      readonly pe: string;
      readonly client: string;
    };
  };
  readonly environment: {
    sysLetter: string;
    temp: string;
    userName: string;
    desktopDir: string;
  };
}

/**
 * 配置管理器类
 */
class ConfigManager {
  private static instance: ConfigManager;
  private _roConfig: ReadOnlyConfig;
  private _config: Config;
  private readonly configPath = './resources/config.json';
  private _isInitialized = false;

  private constructor() {
    // 初始化只读配置
    this._roConfig = {
      id: '240201',
      clientVer: 'V0.3.240201',
      url: {
        home: 'https://www.hotpe.top/',
        github: 'https://github.com/VirtualHotBar/HotPE_Client',
        docs: 'https://docs.hotpe.top/',
        blog: 'https://blog.hotpe.top/',
        donate: 'https://www.hotpe.top/donation/',
        update: 'API/HotPE/GetUpdate/',
        package: {},
      },
      path: {
        execDir: '',
        tools: '.\\resources\\tools\\',
        clientTemp: '.\\resources\\temp\\',
        resources: {
          pe: '.\\resources\\files\\pe\\',
          client: '.\\resources\\files\\client\\',
        },
      },
      environment: {
        sysLetter: '',
        temp: '',
        userName: '',
        desktopDir: '',
      },
    };

    // 初始化默认配置
    this._config = this.getDefaultConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取只读配置
   */
  public get roConfig(): ReadOnlyConfig {
    return this._roConfig;
  }

  /**
   * 获取可变配置
   */
  public get config(): Config {
    return this._config;
  }

  /**
   * 检查是否已初始化
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): Config {
    return {
      api: {
        api: 'https://api.hotpe.top/',
        ghapi: 'http://ghapi.hotpe.top/',
        dl: 'http://p0.hotpe.top/',
      },
      state: {
        install: 'noDown',
        resUpdate: 'without',
        setupToSys: 'without',
      },
      environment: {
        HotPEDrive: {
          new: { diskIndex: -1, letter: '', isMove: false, version: '' },
          all: [],
        },
        ware: {
          system: {
            os: '',
            buildNumber: '',
            userName: '',
            architecture: '',
            firmware: '',
          },
          disks: [],
          partitions: [],
          allLetter: [],
        },
      },
      resources: {
        pe: {
          new: '',
          all: [],
          update: {
            id: '',
            name: '',
            pushTime: '',
            body: '',
            size: 0,
            download_url: '',
            download_url_github: '',
            fileName: '',
          },
        },
        client: {
          new: '',
          all: [],
          update: {
            id: '',
            name: '',
            pushTime: '',
            body: '',
            size: 0,
            download_url: '',
            download_url_github: '',
            fileName: '',
          },
        },
      },
      directory: {},
      notice: {
        show: false,
        type: 'info',
        content: '',
      },
      download: {
        thread: 16,
      },
      setting: {
        pe: {
          bootWaitTime: 3,
        },
        client: {
          themeMode: 'auto',
        },
      },
    };
  }

  /**
   * 初始化环境变量
   */
  private async initializeEnvironment(): Promise<void> {
    try {
      // 获取当前工作目录
      const execDir = await runCmdAsync('cd');
      this._roConfig.path.execDir = `${execDir.replaceAll('\r\n', '')}\\`;

      const sysLetter = await runCmdAsync('echo %SystemDrive%');
      this._roConfig.environment.sysLetter = sysLetter.substring(0, 2);

      const temp = await runCmdAsync('echo %temp%');
      this._roConfig.environment.temp = `${temp.replaceAll('\r\n', '')}\\`;

      const userName = await runCmdAsync('echo %UserName%');
      this._roConfig.environment.userName = userName.replaceAll('\r\n', '');

      const desktopDir = await runCmdAsync('echo %SystemDrive%\\Users\\%UserName%\\Desktop\\');
      this._roConfig.environment.desktopDir = desktopDir.replaceAll('\r\n', '');
    } catch (error) {
      console.error('初始化环境变量失败:', error);
      // 设置默认值
      this._roConfig.path.execDir = 'C:\\';
      this._roConfig.environment.sysLetter = 'C:';
      this._roConfig.environment.temp = 'C:\\temp\\';
      this._roConfig.environment.userName = 'User';
      this._roConfig.environment.desktopDir = 'C:\\Users\\User\\Desktop\\';
    }
  }

  /**
   * 初始化配置
   */
  private async initializeConfig(): Promise<void> {
    try {
      const configExists = await safeFS.existsSync(this.configPath);
      if (configExists) {
        const configContent = await safeFS.readFileSync(this.configPath, 'utf8');
        if (isJSON(configContent)) {
          const loadedConfig = JSON.parse(configContent);
          this._config = { ...this._config, ...loadedConfig }; // 合并配置
        } else {
          // 如果配置文件不是有效JSON，使用默认配置并保存
          await this.saveConfig();
        }
      } else {
        // 如果配置文件不存在，使用默认配置并保存
        await this.saveConfig();
      }
    } catch (error) {
      console.error('初始化配置失败:', error);
      // 使用默认配置
      await this.saveConfig();
    }
  }

  /**
   * 保存配置
   */
  public async saveConfig(): Promise<void> {
    try {
      await writeJosnFile(this.configPath, this._config);
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(updates: Partial<Config>): void {
    this._config = { ...this._config, ...updates };
  }

  /**
   * 深度更新配置
   */
  public deepUpdateConfig(path: string[], value: unknown): void {
    const keys = path;
    let current: Record<string, unknown> = this._config as unknown as Record<string, unknown>;

    for (let i = 0; i < keys.length - 1; i++) {
      if (current == null || typeof current !== 'object') {
        return;
      }

      const key = keys[i];
      if (key === undefined) {
        return;
      }
      if (!(key in current)) {
        current[key] = {};
      }

      const next = current[key];
      if (next == null || typeof next !== 'object') {
        return;
      }
      current = next as Record<string, unknown>;
    }

    if (current != null && typeof current === 'object') {
      const lastKey = keys[keys.length - 1];
      if (lastKey !== undefined) {
        current[lastKey] = value;
      }
    }
  }

  /**
   * 获取配置值
   */
  public getConfigValue<T>(path: string[], defaultValue?: T): T {
    const keys = path;
    let current: unknown = this._config;

    for (const key of keys) {
      if (current && typeof current === 'object' && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return defaultValue as T;
      }
    }

    return current as T;
  }

  /**
   * 初始化所有配置
   */
  public async initializeAll(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    await this.initializeEnvironment();
    await this.initializeConfig();
    this._isInitialized = true;
  }

  /**
   * 重置配置
   */
  public resetConfig(): void {
    this._config = this.getDefaultConfig();
  }
}

// 创建单例实例
const configManager = ConfigManager.getInstance();

// 向后兼容的导出 - 保持原有的使用方式
export const config = configManager.config;
export const roConfig = configManager.roConfig;
export const saveConfig = () => configManager.saveConfig();
export const initializeAll = () => configManager.initializeAll();

// 新的管理器导出 - 提供更强大的功能
export { ConfigManager, configManager };
export type { ReadOnlyConfig };