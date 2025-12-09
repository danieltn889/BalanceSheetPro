#!/bin/bash

# Production Deployment Script
# This script handles production deployment with resource calculations and monitoring

set -e

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-default}"
APP_NAME="${APP_NAME:-balance-sheet-pro}"
DOCKER_IMAGE="${DOCKER_IMAGE:-ghcr.io/${GITHUB_REPOSITORY}:latest}"
DEPLOYMENT_STRATEGY="${DEPLOYMENT_STRATEGY:-rolling}"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        print_error "docker not found. Please install docker."
        exit 1
    fi

    if ! kubectl cluster-info &> /dev/null; then
        print_error "Unable to connect to Kubernetes cluster."
        exit 1
    fi

    print_success "Prerequisites check passed."
}

# Calculate resource requirements
calculate_resources() {
    print_status "Calculating resource requirements..."

    if [ ! -f "scripts/calculate-resources.sh" ]; then
        print_error "Resource calculator script not found."
        exit 1
    fi

    # Run resource calculator
    chmod +x scripts/calculate-resources.sh
    ./scripts/calculate-resources.sh

    if [ ! -f "k8s/resource-requirements.yaml" ]; then
        print_error "Resource requirements file not generated."
        exit 1
    fi

    print_success "Resource requirements calculated."
}

# Deploy to Kubernetes
deploy_to_k8s() {
    print_status "Deploying to Kubernetes..."

    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

    # Apply resource requirements
    kubectl apply -f k8s/resource-requirements.yaml -n $NAMESPACE

    # Apply monitoring configuration
    kubectl apply -f k8s/deployment.yaml -n $NAMESPACE
    kubectl apply -f k8s/service.yaml -n $NAMESPACE

    # Wait for rollout to complete
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=300s

    print_success "Deployment completed successfully."
}

# Run post-deployment verification
verify_deployment() {
    print_status "Running post-deployment verification..."

    # Get service URL
    SERVICE_IP=$(kubectl get svc $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    SERVICE_PORT=$(kubectl get svc $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')

    if [ -z "$SERVICE_IP" ] || [ -z "$SERVICE_PORT" ]; then
        print_error "Unable to get service details."
        exit 1
    fi

    # Test health endpoint
    HEALTH_URL="http://$SERVICE_IP:$SERVICE_PORT/health"
    if curl -f --max-time 30 $HEALTH_URL &> /dev/null; then
        print_success "Health check passed."
    else
        print_error "Health check failed."
        exit 1
    fi

    # Test main application
    APP_URL="http://$SERVICE_IP:$SERVICE_PORT/"
    if curl -f --max-time 30 $APP_URL &> /dev/null; then
        print_success "Application responding correctly."
    else
        print_error "Application not responding."
        exit 1
    fi

    print_success "Post-deployment verification completed."
}

# Run performance test in production
run_prod_perf_test() {
    print_status "Running production performance test..."

    if [ ! -f "artillery.yml" ]; then
        print_warning "Artillery config not found, skipping performance test."
        return
    fi

    # Update artillery config for production endpoint
    SERVICE_IP=$(kubectl get svc $APP_NAME -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    sed -i "s|target:.*|target: 'http://$SERVICE_IP:3000'|" artillery.yml

    # Run artillery test
    npx artillery run artillery.yml --output artillery-report-prod.json

    # Check results
    ERROR_RATE=$(jq -r '(.aggregate.counters | to_entries | map(select(.key | startswith("http.codes.") and (.key != "http.codes.200"))) | map(.value) | add // 0) / (.aggregate.counters."http.requests" // 1) * 100' artillery-report-prod.json 2>/dev/null || echo "0")
    P95_TIME=$(jq -r '.aggregate.summaries."http.response_time".p95 // "0"' artillery-report-prod.json 2>/dev/null || echo "0")

    if (( $(echo "$ERROR_RATE < 10" | bc -l) )) && (( $(echo "$P95_TIME < 500" | bc -l) )); then
        print_success "Production performance test passed (P95: ${P95_TIME}ms, Error Rate: ${ERROR_RATE}%)."
    else
        print_error "Production performance test failed (P95: ${P95_TIME}ms, Error Rate: ${ERROR_RATE}%)."
        exit 1
    fi
}

# Main deployment flow
main() {
    echo "🔧 Balance Sheet Pro - Production Deployment"
    echo "=========================================="

    check_prerequisites
    calculate_resources

    case $DEPLOYMENT_STRATEGY in
        "rolling")
            deploy_to_k8s
            ;;
        "blue-green")
            if [ -f "scripts/blue-green-deploy.sh" ]; then
                chmod +x scripts/blue-green-deploy.sh
                ./scripts/blue-green-deploy.sh
            else
                print_error "Blue-green deployment script not found."
                exit 1
            fi
            ;;
        *)
            print_error "Unknown deployment strategy: $DEPLOYMENT_STRATEGY"
            exit 1
            ;;
    esac

    verify_deployment
    run_prod_perf_test

    print_success "🎉 Production deployment completed successfully!"
    print_status "Application is available at: http://$SERVICE_IP:$SERVICE_PORT"
}

# Run main function
main "$@"