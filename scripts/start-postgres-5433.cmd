@echo off
set DATA_DIR=C:\Users\Felipe\Desktop\accidentes escolares\pg-local\data
set LOG_FILE=C:\Users\Felipe\Desktop\accidentes escolares\pg-local\postgres.log
if exist "%DATA_DIR%\postmaster.pid" del /f /q "%DATA_DIR%\postmaster.pid"
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "%DATA_DIR%" -l "%LOG_FILE%" -o "-p 5433" start
