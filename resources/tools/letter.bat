@echo off &setlocal enabledelayedexpansion
if exist "%tmp%\drives.txt" del /s /q /f "%tmp%\drives.txt" >nul 2>nul
for /f "delims=" %%a in ('fsutil fsinfo drives^| more +1') do (set /p=%%a <nul >>"%tmp%\drives.txt")
for /f "usebackq tokens=1,* delims= " %%a in ("%tmp%\drives.txt") do (set "code=%%b" && set "code=!code:\=!")
echo.!code!
