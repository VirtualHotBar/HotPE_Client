::参数一为新客户端压缩包路径，参数二为客户端路径:末带“\”
@echo off
cd /d "%~dp0"

IF "%1" == "" GOTO exit

echo 释放文件
mkdir ".\updateTemp\"
.\7z\7z.exe x -y "-o.\updateTemp\" "%1" 

echo 清理旧文件
::删除根目录所有文件，不包括文件夹
del "%2*" /F /Q

rd "%2locales\" /S /Q

del "%1" /F /Q
del "%2resources\app.asar" /F /Q
del "%2resources\app-update.yml" /F /Q
del "%2resources\elevate.exe" /F /Q

rd "%2resources\tools\" /S /Q

echo 替换文件
xcopy ".\updateTemp\" "%2" /E /C /Q  /H /R /Y

echo 清理退出
rd ".\updateTemp\" /S /Q
rd ".\7z\" /S /Q

::更新标记
echo. > "%2update.mark"

explorer.exe "%2HotPE Client.exe"

del %0 &&del toUpdate.bat&& exit

:exit
exit