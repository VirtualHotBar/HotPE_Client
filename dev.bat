

@echo off
cd /d "%~dp0"
chcp 65001
cmd /c "start pnpm run dev && start pnpm run dev-main  && dev-ele.bat"