@echo off
cd /d "%~dp0"

pnpm run build
xcopy tools\ dist-bin\win-ia32-unpacked\tools\ /Q  /H /R /E /Y