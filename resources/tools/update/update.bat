@echo off
:: 检查是否具有管理员权限，如果没有则请求提升权限
net session >nul 2>&1
if '%errorlevel%' NEQ '0' (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

::{pack}为新客户端压缩包路径，{clientDir}为客户端路径:末带\
chcp 65001 >nul
mode con cols=60 lines=20
color 03
cd /d "%~dp0"
title HotPE客户端更新中，请稍等...

:: 终止可能正在运行的进程
taskkill /IM "HotPE Client.exe" /F > nul 2>&1
taskkill /IM "HotPE_Client.exe" /F > nul 2>&1
TIMEOUT /T 3 /NOBREAK > nul

:: 如果是隐藏模式运行，则跳转到退出部分
if "%1"=="h" GOTO exit

echo 释放文件
mkdir "%~dp0updateTemp\" > nul 2>&1
if not exist "%~dp0updateTemp\" (
    echo 创建临时目录失败
    goto :error
)

"%~dp07z.exe" x -y "-o%~dp0updateTemp\" "{pack}" > nul 2>&1
if errorlevel 1 (
    echo 解压更新包失败
    goto :error
)

echo 清理旧文件
:: 删除根目录所有文件，不包括文件夹
del "{clientDir}*" /F /Q > nul 2>&1

:: 删除子目录，使用更安全的方式检查目录是否存在再删除
if exist "{clientDir}locales\" rd "{clientDir}locales\" /S /Q > nul 2>&1
if exist "{clientDir}resources\app.asar" del "{clientDir}resources\app.asar" /F /Q > nul 2>&1
if exist "{clientDir}resources\app-update.yml" del "{clientDir}resources\app-update.yml" /F /Q > nul 2>&1
if exist "{clientDir}resources\elevate.exe" del "{clientDir}resources\elevate.exe" /F /Q > nul 2>&1
if exist "{clientDir}resources\config.json" del "{clientDir}resources\config.json" /F /Q > nul 2>&1
if exist "{clientDir}resources\tools\" rd "{clientDir}resources\tools\" /S /Q > nul 2>&1

:: 删除更新包自身
if exist "{pack}" del "{pack}" /F /Q > nul 2>&1

echo 替换文件
if not exist "%~dp0updateTemp\HotPE_Client\" (
    echo 更新包内缺少必要的文件
    goto :error
)

xcopy "%~dp0updateTemp\HotPE_Client\*" "{clientDir}" /E /C /Q /H /R /Y > nul 2>&1
if errorlevel 1 (
    echo 复制文件失败
    goto :error
)

echo 清理退出
if exist "%~dp0updateTemp\" rd "%~dp0updateTemp\" /S /Q > nul 2>&1
if exist "%~dp07z.exe" del "%~dp07z.exe" /F /Q > nul 2>&1
if exist "%~dp07z.dll" del "%~dp07z.dll" /F /Q > nul 2>&1
if exist "%~dp0tmp" del "%~dp0tmp" /F /Q > nul 2>&1

:: 创建更新标记
echo. > "{clientDir}update.mark"

:: 以隐藏模式重新启动此脚本以完成最终步骤
powershell -Command "Start-Process -FilePath '%~f0' -ArgumentList 'h' -Verb RunAs -WindowStyle Hidden"
exit /b

:error
echo 更新过程中发生错误
pause
exit /b

:exit
cd /d "{clientDir}" && start /b cmd /c "{clientDir}HotPE_Client.exe"
del "%~f0" > nul 2>&1
exit /b