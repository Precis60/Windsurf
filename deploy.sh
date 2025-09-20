#!/bin/bash

# Secure Deployment Script for Precision Cabling & Automation
# Enterprise-grade deployment for security industry

set -e  # Exit on any error

echo "🚀 Starting secure deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    npm run build
    print_success "Frontend built successfully"
}

# Deploy to GitHub Pages
deploy_frontend() {
    print_status "Deploying frontend to GitHub Pages..."
    npm run deploy
    print_success "Frontend deployed to GitHub Pages"
}

# Update API endpoint in production
update_api_endpoint() {
    print_status "Updating API endpoint for production..."
    
    # This will be updated once we have the backend URL
    print_warning "Remember to update the API_BASE_URL in src/services/secureApi.js"
    print_warning "Replace 'https://your-secure-domain.com/api' with your actual backend URL"
}

# Main deployment process
main() {
    print_status "🔒 Precision Cabling & Automation - Secure Deployment"
    print_status "=================================================="
    
    check_dependencies
    
    # Build and deploy frontend
    build_frontend
    deploy_frontend
    
    update_api_endpoint
    
    print_success "🎉 Deployment completed!"
    print_status "Next steps:"
    echo "1. Set up your database (see DEPLOYMENT_GUIDE.md)"
    echo "2. Deploy your backend to Railway/Render"
    echo "3. Update API endpoint in frontend"
    echo "4. Test the complete system"
    
    print_status "Your secure site is available at: https://precis60.github.io/Windsurf/"
}

# Run main function
main "$@"
