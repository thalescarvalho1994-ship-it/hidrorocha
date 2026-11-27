@echo off
chcp 65001 >nul
echo Instalando o app de laudos Wilton Rocha...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar.ps1"
if errorlevel 1 (
  echo.
  echo Algo deu errado. Tire uma foto desta janela e mande para quem enviou o app.
)
echo.
pause
