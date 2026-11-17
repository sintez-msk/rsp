@echo off
chcp 65001 >nul
echo.
echo Сейчас выйдем из старого аккаунта и войдём заново.
echo В браузере войдите под аккаунтом с доступом к sintez-msk/rsp
echo (часто это аккаунт организации sintez-msk или ваш личный с правами).
echo.
pause

gh auth logout -h github.com -u anton-migitko 2>nul
gh auth logout -h github.com 2>nul

echo.
echo Запуск входа...
gh auth login -h github.com -p https -w

echo.
echo Проверка:
gh auth status
echo.
echo Если всё ок — запустите обновить-сайт.bat
pause
