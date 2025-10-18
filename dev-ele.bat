@echo off
net session >nul 2>&1
if '%errorlevel%' NEQ '0' (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)

@echo off
cd /d "%~dp0"
chcp 65001
npm run dev-ele