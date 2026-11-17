@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add docs/index.html
git commit -m "Add day detail panel on calendar click"
git push origin main
echo.
echo Готово. Обновите сайт Ctrl+F5
pause
