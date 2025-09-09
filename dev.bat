@echo off
cd /d "%~dp0"
chcp 65001
start npm run dev-web

start dev-ele.bat

npm run dev-main