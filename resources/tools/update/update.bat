%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit

::{pack}为新客户端压缩包路径，{clientDir}为客户端路径:末带\
@echo off
chcp 65001
mode con cols=60 lines=20
color 03
title HotPE客户端更新
TIMEOUT /T 3
cd /d "%~dp0"

if "%1"=="h" GOTO exit

echo 释放文件
mkdir "%~dp0updateTemp\"
"%~dp07z.exe" x -y "-o%~dp0updateTemp\" "{pack}" 

echo 清理旧文件
::删除根目录所有文件，不包括文件夹
del "{clientDir}*" /F /Q

rd "{clientDir}locales\" /S /Q

del "{pack}" /F /Q
del "{clientDir}resources\app.asar" /F /Q
del "{clientDir}resources\app-update.yml" /F /Q
del "{clientDir}resources\elevate.exe" /F /Q

rd "{clientDir}resources\tools\" /S /Q

echo 替换文件
xcopy "%~dp0updateTemp\" "{clientDir}" /E /C /Q  /H /R /Y

echo 清理退出
rd "%~dp0updateTemp\" /S /Q
::rd ".\7z\" /S /Q
del "%~dp07z.exe" /F /Q
del "%~dp07z.dll" /F /Q


::更新标记
echo. > "{clientDir}update.mark"

start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit

:exit
cd /d "{clientDir}" && start /b cmd /c "{clientDir}HotPE Client.exe"

del %0 && exit