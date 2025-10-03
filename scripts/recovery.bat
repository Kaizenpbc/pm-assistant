@echo off
setlocal enabledelayedexpansion

REM PM Application v2 - Quick Recovery Script (Windows)
REM This script performs a complete system reset and recovery

title PM Application v2 - Quick Recovery

echo.
echo ================================
echo PM APPLICATION v2 - QUICK RECOVERY
echo ================================
echo This script will perform a complete system reset and recovery
echo.

REM Step 1: Stop all services
echo ================================
echo STEP 1: STOPPING ALL SERVICES
echo ================================

echo [INFO] Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Node.js processes stopped
) else (
    echo [INFO] No Node.js processes running
)

echo [INFO] Stopping Docker containers...
docker-compose down >nul 2>&1
docker-compose -f docker-compose.dev.yml down >nul 2>&1
echo [SUCCESS] Docker containers stopped

REM Step 2: Clean up
echo.
echo ================================
echo STEP 2: CLEANING UP
echo ================================

if exist "src\client\node_modules" (
    echo [INFO] Removing client node_modules...
    rmdir /s /q "src\client\node_modules"
    echo [SUCCESS] Client node_modules removed
)

if exist "dist" (
    echo [INFO] Removing build artifacts...
    rmdir /s /q "dist"
    echo [SUCCESS] Build artifacts removed
)

if exist "src\client\dist" (
    echo [INFO] Removing client build artifacts...
    rmdir /s /q "src\client\dist"
    echo [SUCCESS] Client build artifacts removed
)

REM Step 3: Start database
echo.
echo ================================
echo STEP 3: STARTING DATABASE
echo ================================

echo [INFO] Starting MySQL with Docker...
docker-compose up -d mysql
if %errorlevel% equ 0 (
    echo [SUCCESS] MySQL container started
) else (
    echo [WARNING] Failed to start MySQL container
    echo [WARNING] Please check Docker is running and try again
)

REM Wait for database to be ready
echo [INFO] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Step 4: Validate configuration
echo.
echo ================================
echo STEP 4: VALIDATING CONFIGURATION
echo ================================

if exist ".env" (
    echo [INFO] Configuration file found
    echo [INFO] Validating configuration...
    npm run config:validate
    if %errorlevel% equ 0 (
        echo [SUCCESS] Configuration is valid
    ) else (
        echo [WARNING] Configuration validation failed
    )
) else (
    echo [WARNING] .env file not found
    echo [INFO] Generating new .env file...
    npm run config:generate-env
    if %errorlevel% equ 0 (
        echo [SUCCESS] .env file generated
    ) else (
        echo [ERROR] Failed to generate .env file
        pause
        exit /b 1
    )
)

REM Step 5: Install dependencies
echo.
echo ================================
echo STEP 5: INSTALLING DEPENDENCIES
echo ================================

echo [INFO] Installing root dependencies...
npm install
if %errorlevel% equ 0 (
    echo [SUCCESS] Root dependencies installed
) else (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

if exist "src\client\package.json" (
    echo [INFO] Installing client dependencies...
    cd src\client
    npm install
    if %errorlevel% equ 0 (
        echo [SUCCESS] Client dependencies installed
    ) else (
        echo [ERROR] Failed to install client dependencies
        cd ..\..
        pause
        exit /b 1
    )
    cd ..\..
)

REM Step 6: Start services
echo.
echo ================================
echo STEP 6: STARTING SERVICES
echo ================================

echo [INFO] Starting backend server...
start "PM Backend" cmd /k "npm run server:dev"

REM Wait for backend to start
echo [INFO] Waiting for backend to be ready...
timeout /t 15 /nobreak >nul

REM Check if backend is responding
curl -s http://localhost:3001/health/basic >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend server is ready
) else (
    echo [WARNING] Backend server may not be ready yet
)

echo [INFO] Starting frontend server...
start "PM Frontend" cmd /k "cd src\client && npm run dev"

REM Wait for frontend to start
echo [INFO] Waiting for frontend to be ready...
timeout /t 10 /nobreak >nul

REM Step 7: Health check
echo.
echo ================================
echo STEP 7: FINAL HEALTH CHECK
echo ================================

echo [INFO] Running comprehensive health check...
npm run health:script

echo.
echo ================================
echo RECOVERY COMPLETE!
echo ================================
echo.
echo ✅ All services are starting up
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3001
echo 🗄️  Database: localhost:3306
echo 🔐 Login: test/password
echo.
echo 💡 Check the opened terminal windows for service logs
echo 💡 Press any key to exit this script
echo.

pause >nul
