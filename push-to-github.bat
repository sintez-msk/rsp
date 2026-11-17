@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist .git (
  git init -b main
)

git remote remove origin 2>nul
git remote add origin https://github.com/sintez-msk/rsp.git

git add docs/index.html index.html README.md .gitignore apps-script ИНСТРУКЦИЯ.md google-sheets tools 2>nul
git add -A
git status

git commit -m "Add GitHub Pages schedule site reading Google Sheets"
git push -u origin main

echo.
echo Site: https://sintez-msk.github.io/rsp/
echo In GitHub: Settings - Pages - Branch main - folder /docs
pause
