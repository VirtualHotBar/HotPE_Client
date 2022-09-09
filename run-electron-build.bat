@echo off
rem copy .\index.js .\public\electron.js
copy .\index.ts .\build\electron.js

rem powershell -Command "(gc .\build\index.html) -replace '/static/', 'static/' | Out-File .\build\index.html"
Yarn run electron-build