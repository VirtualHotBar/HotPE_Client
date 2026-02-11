module.exports = {
  packagerConfig: {
    asar: ture,
    platform: "win32",
    //extraArguments: ['--no-sandbox'], 
    name: 'HotPE_Client',
    icon: './logo.ico',
    extraResource: ['resources/tools'],
    win32metadata: {
      "requested-execution-level": "requireAdministrator"
    },
    // Keep Vite output lean, but allow runtime-required third-party modules.
    ignore: (file) => {
      if (!file) return false;
      if (file === '/node_modules') return false;
      return !(
        file.startsWith('/.vite') ||
        file.startsWith('/node_modules/iconv-lite') ||
        file.startsWith('/node_modules/safer-buffer')
      );
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: './scripts/maker-7z.js',
      platforms: ['win32'],
    }, 
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main/index.ts',
            config: 'vite.main.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            entry: 'src/view/index.tsx',
            config: 'vite.renderer.config.ts',
          },
        ],
      },
    },
  ],
};
