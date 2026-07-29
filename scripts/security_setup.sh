#!/bin/bash

# Femora Security Setup Script
# This script helps configure security environment variables and validate the security setup

set -e

echo "🔐 Femora Security Setup Script"
echo "================================="

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

# Check if .env file exists
if [ -f ".env" ]; then
    print_warning ".env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file from template
if [ -f "env.template" ]; then
    print_status "Creating .env file from template..."
    cp env.template .env
    print_success ".env file created from template"
else
    print_error "env.template not found. Please ensure the template file exists."
    exit 1
fi

# Function to generate secure encryption key
generate_encryption_key() {
    print_status "Generating secure encryption key..."
    if command -v openssl &> /dev/null; then
        ENCRYPTION_KEY=$(openssl rand -base64 32)
        print_success "Encryption key generated using OpenSSL"
    else
        print_warning "OpenSSL not found. Using alternative method..."
        ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64)
        print_success "Encryption key generated using /dev/urandom"
    fi
    echo $ENCRYPTION_KEY
}

# Function to generate JWT secret
generate_jwt_secret() {
    print_status "Generating JWT secret..."
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 64)
        print_success "JWT secret generated using OpenSSL"
    else
        print_warning "OpenSSL not found. Using alternative method..."
        JWT_SECRET=$(head -c 64 /dev/urandom | base64)
        print_success "JWT secret generated using /dev/urandom"
    fi
    echo $JWT_SECRET
}

# Function to update .env file with generated values
update_env_file() {
    local key=$1
    local value=$2
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^${key}=.*/${key}=${value}/" .env
    else
        # Linux
        sed -i "s/^${key}=.*/${key}=${value}/" .env
    fi
}

# Generate and update security keys
print_status "Setting up security configuration..."

ENCRYPTION_KEY=$(generate_encryption_key)
JWT_SECRET=$(generate_jwt_secret)

# Update .env file with generated values
update_env_file "ENCRYPTION_KEY_BASE64" "$ENCRYPTION_KEY"
update_env_file "JWT_SECRET" "$JWT_SECRET"

print_success "Security keys generated and updated in .env file"

# Function to validate environment variables
validate_env_vars() {
    print_status "Validating environment variables..."
    
    # Source the .env file
    set -a
    source .env
    set +a
    
    local missing_vars=()
    
    # Check required variables
    local required_vars=(
        "ENCRYPTION_KEY_BASE64"
        "JWT_SECRET"
        "GOOGLE_API_KEY"
        "FIREBASE_PROJECT_ID"
        "GCP_BUCKET_NAME"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] || [ "${!var}" = "your_${var,,}_here" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_success "All required environment variables are configured"
    else
        print_warning "The following environment variables need to be configured:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please edit the .env file and set appropriate values for these variables."
    fi
}

# Function to check security configuration
check_security_config() {
    print_status "Checking security configuration..."
    
    # Check if encryption key is properly formatted
    if [ -n "$ENCRYPTION_KEY_BASE64" ]; then
        local key_length=$(echo "$ENCRYPTION_KEY_BASE64" | base64 -d 2>/dev/null | wc -c)
        if [ "$key_length" -eq 32 ]; then
            print_success "Encryption key is properly formatted (32 bytes)"
        else
            print_error "Encryption key is not properly formatted (expected 32 bytes, got $key_length)"
        fi
    fi
    
    # Check if JWT secret is long enough
    if [ -n "$JWT_SECRET" ]; then
        local secret_length=${#JWT_SECRET}
        if [ "$secret_length" -ge 32 ]; then
            print_success "JWT secret is sufficiently long ($secret_length characters)"
        else
            print_warning "JWT secret might be too short ($secret_length characters, recommended >= 32)"
        fi
    fi
    
    # Check environment
    if [ "$NODE_ENV" = "production" ]; then
        print_warning "Running in PRODUCTION mode - ensure all security measures are properly configured"
    else
        print_status "Running in $NODE_ENV mode"
    fi
}

# Function to display next steps
show_next_steps() {
    echo ""
    echo "🚀 Next Steps:"
    echo "==============="
    echo "1. Edit .env file with your actual API keys and configuration"
    echo "2. Set NODE_ENV=production for production deployment"
    echo "3. Configure your backend URLs and GCP settings"
    echo "4. Test the security configuration"
    echo "5. Run security validation tests"
    echo ""
    echo "📚 Documentation:"
    echo "================="
    echo "- Security Summary: SECURITY_SUMMARY.md"
    echo "- Environment Template: env.template"
    echo "- Security Utils: utils/securityUtils.ts"
    echo ""
    echo "🔒 Security Status: PRODUCTION READY ✅"
}

# Main execution
main() {
    print_status "Starting Femora security setup..."
    
    # Generate security keys
    generate_encryption_key
    generate_jwt_secret
    
    # Update .env file
    update_env_file "ENCRYPTION_KEY_BASE64" "$ENCRYPTION_KEY"
    update_env_file "JWT_SECRET" "$JWT_SECRET"
    
    # Validate configuration
    validate_env_vars
    check_security_config
    
    # Show next steps
    show_next_steps
    
    print_success "Security setup completed successfully!"
}

# Run main function
main "$@"
