@echo off
rem copy .\build-mian\index.js .\public\electron.js
rem copy .\build-mian\index.js .\build\electron.js

rem powershell -Command "(gc .\build\index.html) -replace '/static/', 'static/' | Out-File .\build\index.html"
Yarn run electron-build
