# 开发服务器
```batch
rem 启动渲染进程调试
yarn run dev 

rem 启动主进程调试
yarn run dev-main 

rem 启动electron调试
yarn run dev-ele 

rem 一键启动
cmd /c "start yarn run dev && start yarn run dev-main  && yarn run dev-ele"
```

# 构建
直接输出二进制可执行文件
```batch
yarn run build
```

## 更新依赖

- 更新包的版本（主版本）

```coffeescript
第一步全局安装：
npm install -g npm-check-updates

第二步运行：
ncu -u 
作用：升级 package.json 文件的 dependencies 和 devDependencies 中的所有版本

第三步更新：
npm update
作用：package-lock.json 文件会被新版本填充
```