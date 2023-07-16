@echo off
cd /d "%~dp0"

cnpm run build
xcopy resources\tools\ dist-bin\win-ia32-unpacked\resources\tools\ /Q /H /R /E /Y