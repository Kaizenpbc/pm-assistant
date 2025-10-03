#!/bin/bash

# PM Application v2 - Quick Recovery Script
# This script performs a complete system reset and recovery

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    if command_exists netstat; then
        netstat -tuln | grep -q ":$1 "
    elif command_exists lsof; then
        lsof -i ":$1" >/dev/null 2>&1
    else
        return 1
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service_name=$2
    
    if port_in_use $port; then
        print_warning "$service_name is running on port $port, stopping..."
        
        if command_exists lsof; then
            PIDS=$(lsof -ti ":$port")
            if [ ! -z "$PIDS" ]; then
                echo $PIDS | xargs kill -9
                print_success "$service_name stopped"
            fi
        elif command_exists netstat; then
            PIDS=$(netstat -tulpn | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
            if [ ! -z "$PIDS" ]; then
                echo $PIDS | xargs kill -9
                print_success "$service_name stopped"
            fi
        fi
    else
        print_status "$service_name not running on port $port"
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Main recovery function
main() {
    print_header "PM APPLICATION v2 - QUICK RECOVERY"
    echo -e "${CYAN}This script will perform a complete system reset and recovery${NC}"
    echo ""
    
    # Step 1: Stop all services
    print_header "STEP 1: STOPPING ALL SERVICES"
    
    kill_port 3001 "Backend Server"
    kill_port 5173 "Frontend Server"
    kill_port 3306 "MySQL Database"
    
    # Stop Docker containers if running
    if command_exists docker; then
        print_status "Stopping Docker containers..."
        docker-compose down 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        print_success "Docker containers stopped"
    fi
    
    # Step 2: Clean up
    print_header "STEP 2: CLEANING UP"
    
    # Clean node_modules in client
    if [ -d "src/client/node_modules" ]; then
        print_status "Removing client node_modules..."
        rm -rf src/client/node_modules
        print_success "Client node_modules removed"
    fi
    
    # Clean build artifacts
    if [ -d "dist" ]; then
        print_status "Removing build artifacts..."
        rm -rf dist
        print_success "Build artifacts removed"
    fi
    
    # Step 3: Start database
    print_header "STEP 3: STARTING DATABASE"
    
    if command_exists docker; then
        print_status "Starting MySQL with Docker..."
        docker-compose up -d mysql
        wait_for_service "http://localhost:3001/health/ready" "Database"
    else
        print_warning "Docker not found, skipping database startup"
        print_warning "Please start MySQL manually: sudo service mysql start"
    fi
    
    # Step 4: Validate configuration
    print_header "STEP 4: VALIDATING CONFIGURATION"
    
    if [ -f ".env" ]; then
        print_status "Configuration file found"
        if command_exists node && [ -f "package.json" ]; then
            npm run config:validate
        else
            print_warning "Node.js or package.json not found, skipping config validation"
        fi
    else
        print_warning ".env file not found"
        print_status "Generating new .env file..."
        if command_exists node && [ -f "package.json" ]; then
            npm run config:generate-env
        else
            print_error "Cannot generate .env file without Node.js"
            return 1
        fi
    fi
    
    # Step 5: Install dependencies
    print_header "STEP 5: INSTALLING DEPENDENCIES"
    
    if [ -f "package.json" ]; then
        print_status "Installing root dependencies..."
        npm install
        print_success "Root dependencies installed"
        
        if [ -f "src/client/package.json" ]; then
            print_status "Installing client dependencies..."
            cd src/client
            npm install
            cd ../..
            print_success "Client dependencies installed"
        fi
    else
        print_error "package.json not found in project root"
        return 1
    fi
    
    # Step 6: Start services
    print_header "STEP 6: STARTING SERVICES"
    
    if command_exists node && [ -f "package.json" ]; then
        print_status "Starting backend server..."
        npm run server:dev &
        BACKEND_PID=$!
        
        wait_for_service "http://localhost:3001/health/basic" "Backend Server"
        
        print_status "Starting frontend server..."
        npm run client:dev &
        FRONTEND_PID=$!
        
        wait_for_service "http://localhost:5173" "Frontend Server"
        
        print_success "All services started successfully!"
        
        # Step 7: Health check
        print_header "STEP 7: FINAL HEALTH CHECK"
        
        print_status "Running comprehensive health check..."
        npm run health:script
        
        print_header "RECOVERY COMPLETE!"
        echo -e "${GREEN}✅ All services are running and healthy${NC}"
        echo -e "${CYAN}🌐 Frontend: http://localhost:5173${NC}"
        echo -e "${CYAN}🔧 Backend: http://localhost:3001${NC}"
        echo -e "${CYAN}🗄️  Database: localhost:3306${NC}"
        echo -e "${CYAN}🔐 Login: test/password${NC}"
        echo ""
        echo -e "${YELLOW}💡 To stop services: Ctrl+C or kill $BACKEND_PID $FRONTEND_PID${NC}"
        
    else
        print_error "Node.js not found or package.json missing"
        return 1
    fi
}

# Handle script interruption
cleanup() {
    print_warning "Recovery interrupted, cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 1
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check prerequisites
check_prerequisites() {
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again"
        exit 1
    fi
}

# Run the script
check_prerequisites
main "$@"
