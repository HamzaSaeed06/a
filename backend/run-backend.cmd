@echo off
cd /d "%~dp0"
node server.js >> backend-dev.out.log 2>&1
