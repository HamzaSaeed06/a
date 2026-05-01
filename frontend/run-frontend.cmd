@echo off
cd /d "%~dp0"
npm run dev -- --port 5000 >> frontend-dev.out.log 2>&1
