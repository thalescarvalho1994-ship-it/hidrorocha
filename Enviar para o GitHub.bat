@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Enviando as mudancas do app para o GitHub...
echo.
git push
echo.
if errorlevel 1 (
  echo Algo deu errado. Tire uma foto desta janela e mande para o Claude.
) else (
  echo Pronto! As mudancas foram enviadas.
)
echo.
pause
