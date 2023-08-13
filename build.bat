@echo off
cd /d "%~dp0"

rd .\resources\files\ /S /Q
rd .\resources\temp\ /S /Q
del .\resources\config.json

cnpm run build
::xcopy resources\tools\ dist-bin\win-ia32-unpacked\resources\tools\ /Q /H /R /E /Y