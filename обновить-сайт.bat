@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add docs/index.html
git commit -m "Remove subtitle under schedule title"
git push origin main
echo.
echo Готово. Обновите https://sintez-msk.github.io/rsp/ через Ctrl+F5
pause
