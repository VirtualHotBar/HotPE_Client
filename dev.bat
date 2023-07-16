

@echo off
cd /d "%~dp0"
chcp 65001
cmd /c "start cnpm run dev && start cnpm run dev-main  && dev-ele.bat"