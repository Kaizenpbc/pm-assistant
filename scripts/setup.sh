#!/bin/bash

# PM Application v2 - New Environment Setup Script
# This script sets up a complete development environment from scratch

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

# Function to check system requirements
check_requirements() {
    print_header "CHECKING SYSTEM REQUIREMENTS"
    
    local missing_deps=()
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is 18+
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version 18+ recommended (found: $NODE_VERSION)"
        fi
    else
        missing_deps+=("Node.js 18+")
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        missing_deps+=("npm")
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found (optional, but recommended for database)"
    fi
    
    # Check Git
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_success "Git found: $GIT_VERSION"
    else
        print_warning "Git not found (optional, but recommended for version control)"
    fi
    
    # Check curl
    if command_exists curl; then
        print_success "curl found"
    else
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        print_error "Please install the missing dependencies and run this script again"
        exit 1
    fi
    
    print_success "All required dependencies found!"
}

# Function to setup environment
setup_environment() {
    print_header "SETTING UP ENVIRONMENT"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        npm run config:generate-env
        print_success ".env file created"
    else
        print_status ".env file already exists"
    fi
    
    # Validate configuration
    print_status "Validating configuration..."
    npm run config:validate
    print_success "Configuration validated"
}

# Function to install dependencies
install_dependencies() {
    print_header "INSTALLING DEPENDENCIES"
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
    
    # Install client dependencies
    if [ -f "src/client/package.json" ]; then
        print_status "Installing client dependencies..."
        cd src/client
        npm install
        cd ../..
        print_success "Client dependencies installed"
    fi
}

# Function to setup database
setup_database() {
    print_header "SETTING UP DATABASE"
    
    if command_exists docker; then
        print_status "Starting MySQL with Docker..."
        docker-compose up -d mysql
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -s http://localhost:3001/health/ready >/dev/null 2>&1; then
                print_success "Database is ready!"
                return 0
            fi
            
            echo -n "."
            sleep 2
            attempt=$((attempt + 1))
        done
        
        print_warning "Database may not be ready yet, continuing..."
    else
        print_warning "Docker not found, skipping database setup"
        print_warning "Please install Docker and start MySQL manually"
    fi
}

# Function to run tests
run_tests() {
    print_header "RUNNING TESTS"
    
    if [ -f "package.json" ]; then
        print_status "Running configuration validation..."
        npm run config:check
        
        if command_exists npm && npm run test >/dev/null 2>&1; then
            print_status "Running unit tests..."
            npm run test
            print_success "Tests completed"
        else
            print_warning "No tests configured or test command failed"
        fi
    fi
}

# Function to show next steps
show_next_steps() {
    print_header "SETUP COMPLETE!"
    
    echo -e "${GREEN}✅ Environment setup completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}🚀 Next Steps:${NC}"
    echo "  1. Start the development servers:"
    echo "     npm run dev:simple"
    echo ""
    echo "  2. Or start services individually:"
    echo "     npm run server:dev    # Backend on port 3001"
    echo "     npm run client:dev    # Frontend on port 5173"
    echo ""
    echo "  3. Access the application:"
    echo "     🌐 Frontend: http://localhost:5173"
    echo "     🔧 Backend: http://localhost:3001"
    echo "     🗄️  Database: localhost:3306"
    echo "     🔐 Login: test/password"
    echo ""
    echo -e "${CYAN}🛠️ Useful Commands:${NC}"
    echo "  npm run health:script     # Check system health"
    echo "  npm run config:validate   # Validate configuration"
    echo "  npm run docker:dev        # Start with Docker"
    echo "  npm run test              # Run tests"
    echo ""
    echo -e "${CYAN}📚 Documentation:${NC}"
    echo "  README.md                 # Project overview"
    echo "  PRODUCT_MANUAL.md         # Complete feature guide"
    echo "  SECURITY_GUIDE.md         # Security implementation"
    echo "  TESTING_GUIDE.md          # Testing documentation"
    echo ""
    echo -e "${YELLOW}💡 If you encounter issues, run: npm run recovery${NC}"
}

# Function to show system information
show_system_info() {
    print_header "SYSTEM INFORMATION"
    
    echo "Operating System: $(uname -s)"
    echo "Architecture: $(uname -m)"
    echo "Shell: $SHELL"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    
    if command_exists docker; then
        echo "Docker: $(docker --version)"
    fi
    
    if command_exists git; then
        echo "Git: $(git --version)"
    fi
    
    echo ""
    echo "Project Directory: $(pwd)"
    echo "Timestamp: $(date)"
}

# Main setup function
main() {
    print_header "PM APPLICATION v2 - NEW ENVIRONMENT SETUP"
    echo -e "${CYAN}This script will set up a complete development environment${NC}"
    echo ""
    
    show_system_info
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    run_tests
    show_next_steps
}

# Run the script
main "$@"
