@echo off
title Jarvis Front - Dev Mode
cd /d "%~dp0"

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: npm nao esta instalado ou nao esta no PATH!
    pause
    exit
)

echo ----------------------------
echo Iniciando Frontend Jarvis
echo ----------------------------

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

npm run dev

pause
