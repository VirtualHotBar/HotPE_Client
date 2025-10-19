
module.exports = {
  packagerConfig: {
    asar: true,
    platform: "win32",
    name: 'HotPE_Client',
    icon: './logo.ico',
    extraResource: ['resources/tools'],
    ignore: ['src', 'resources'],
    win32metadata: {
      "requested-execution-level": "requireAdministrator"
    }
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