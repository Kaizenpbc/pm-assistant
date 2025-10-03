@echo off
setlocal enabledelayedexpansion

REM PM Application v2 - New Environment Setup Script (Windows)
REM This script sets up a complete development environment from scratch

title PM Application v2 - New Environment Setup

echo.
echo ================================
echo PM APPLICATION v2 - NEW ENVIRONMENT SETUP
echo ================================
echo This script will set up a complete development environment
echo.

REM Check system requirements
echo ================================
echo CHECKING SYSTEM REQUIREMENTS
echo ================================

echo [INFO] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js found: !NODE_VERSION!
) else (
    echo [ERROR] Node.js not found - Please install Node.js 18+ and try again
    pause
    exit /b 1
)

echo [INFO] Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [SUCCESS] npm found: !NPM_VERSION!
) else (
    echo [ERROR] npm not found - Please install npm and try again
    pause
    exit /b 1
)

echo [INFO] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo [SUCCESS] Docker found: !DOCKER_VERSION!
) else (
    echo [WARNING] Docker not found - Optional but recommended for database
)

echo [INFO] Checking Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [SUCCESS] Git found: !GIT_VERSION!
) else (
    echo [WARNING] Git not found - Optional but recommended for version control
)

echo [SUCCESS] All required dependencies found!

REM Setup environment
echo.
echo ================================
echo SETTING UP ENVIRONMENT
echo ================================

if not exist ".env" (
    echo [INFO] Creating .env file...
    npm run config:generate-env
    if %errorlevel% equ 0 (
        echo [SUCCESS] .env file created
    ) else (
        echo [ERROR] Failed to create .env file
        pause
        exit /b 1
    )
) else (
    echo [INFO] .env file already exists
)

echo [INFO] Validating configuration...
npm run config:validate
if %errorlevel% equ 0 (
    echo [SUCCESS] Configuration validated
) else (
    echo [WARNING] Configuration validation failed
)

REM Install dependencies
echo.
echo ================================
echo INSTALLING DEPENDENCIES
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

REM Setup database
echo.
echo ================================
echo SETTING UP DATABASE
echo ================================

docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting MySQL with Docker...
    docker-compose up -d mysql
    if %errorlevel% equ 0 (
        echo [SUCCESS] MySQL container started
        echo [INFO] Waiting for database to be ready...
        timeout /t 15 /nobreak >nul
    ) else (
        echo [WARNING] Failed to start MySQL container
        echo [WARNING] Please check Docker is running
    )
) else (
    echo [WARNING] Docker not found, skipping database setup
    echo [WARNING] Please install Docker and start MySQL manually
)

REM Run tests
echo.
echo ================================
echo RUNNING TESTS
echo ================================

echo [INFO] Running configuration validation...
npm run config:check
if %errorlevel% equ 0 (
    echo [SUCCESS] Configuration check passed
) else (
    echo [WARNING] Configuration check failed
)

REM Show next steps
echo.
echo ================================
echo SETUP COMPLETE!
echo ================================
echo.
echo ✅ Environment setup completed successfully!
echo.
echo 🚀 Next Steps:
echo   1. Start the development servers:
echo      npm run dev:simple
echo.
echo   2. Or start services individually:
echo      npm run server:dev    # Backend on port 3001
echo      npm run client:dev    # Frontend on port 5173
echo.
echo   3. Access the application:
echo      🌐 Frontend: http://localhost:5173
echo      🔧 Backend: http://localhost:3001
echo      🗄️  Database: localhost:3306
echo      🔐 Login: test/password
echo.
echo 🛠️ Useful Commands:
echo   npm run health:script     # Check system health
echo   npm run config:validate   # Validate configuration
echo   npm run docker:dev        # Start with Docker
echo   npm run test              # Run tests
echo.
echo 📚 Documentation:
echo   README.md                 # Project overview
echo   PRODUCT_MANUAL.md         # Complete feature guide
echo   SECURITY_GUIDE.md         # Security implementation
echo   TESTING_GUIDE.md          # Testing documentation
echo.
echo 💡 If you encounter issues, run: npm run recovery
echo.
echo Press any key to exit...
pause >nul
