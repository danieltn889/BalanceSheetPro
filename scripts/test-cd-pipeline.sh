#!/bin/bash

# CD Pipeline Local Validation Script
# Tests all components of the CI/CD pipeline locally

set -e

echo "🧪 CD Pipeline Local Validation"
echo "==============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Function to print test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Test 1: Resource Calculator
echo "1. Testing Resource Calculator..."
if ./scripts/calculate-resources.sh > /dev/null 2>&1; then
    test_result 0 "Resource calculator runs successfully"
    if [ -f "k8s/resource-requirements.yaml" ]; then
        test_result 0 "Resource requirements file generated"
    else
        test_result 1 "Resource requirements file not found"
        echo "Current directory: $(pwd)"
        echo "Files in k8s/: $(ls -la k8s/ 2>/dev/null || echo 'k8s directory not found')"
    fi
else
    test_result 1 "Resource calculator failed to run"
fi

# Test 2: Blue-Green Deployment Script
echo "2. Testing Blue-Green Deployment Script..."
if [ -f "scripts/blue-green-deploy.sh" ] && [ -x "scripts/blue-green-deploy.sh" ]; then
    test_result 0 "Blue-green script exists and is executable"
    # Check if script has basic structure
    if grep -q "kubectl" scripts/blue-green-deploy.sh; then
        test_result 0 "Blue-green script contains kubectl commands"
    else
        test_result 1 "Blue-green script missing kubectl commands"
    fi
else
    test_result 1 "Blue-green script not found or not executable"
fi

# Test 3: Production Deployment Script
echo "3. Testing Production Deployment Script..."
if [ -f "scripts/deploy-production.sh" ] && [ -x "scripts/deploy-production.sh" ]; then
    test_result 0 "Production deployment script exists and is executable"
    # Check if script calls resource calculator
    if grep -q "calculate-resources.sh" scripts/deploy-production.sh; then
        test_result 0 "Production script calls resource calculator"
    else
        test_result 1 "Production script doesn't call resource calculator"
    fi
else
    test_result 1 "Production deployment script not found or not executable"
fi

# Test 4: Kubernetes Manifests
echo "4. Testing Kubernetes Manifests..."
if [ -f "k8s/deployment.yaml" ]; then
    test_result 0 "Deployment manifest exists"
    if grep -q "resources:" k8s/deployment.yaml; then
        test_result 0 "Deployment has resource specifications"
    else
        test_result 1 "Deployment missing resource specifications"
    fi
else
    test_result 1 "Deployment manifest not found"
fi

if [ -f "k8s/service.yaml" ]; then
    test_result 0 "Service manifest exists"
else
    test_result 1 "Service manifest not found"
fi

# Test 5: CI/CD Workflow
echo "5. Testing CI/CD Workflow..."
if [ -f ".github/workflows/ci.yml" ]; then
    test_result 0 "CI/CD workflow exists"
    if grep -q "production:" .github/workflows/ci.yml; then
        test_result 0 "Workflow has production job"
    else
        test_result 1 "Workflow missing production job"
    fi
    if grep -q "deploy-production.sh" .github/workflows/ci.yml; then
        test_result 0 "Workflow calls production deployment script"
    else
        test_result 1 "Workflow doesn't call production deployment script"
    fi
else
    test_result 1 "CI/CD workflow not found"
fi

# Test 6: Docker Configuration
echo "6. Testing Docker Configuration..."
if [ -f "Dockerfile" ]; then
    test_result 0 "Dockerfile exists"
    if grep -q "EXPOSE 3000" Dockerfile; then
        test_result 0 "Dockerfile exposes correct port"
    else
        test_result 1 "Dockerfile doesn't expose port 3000"
    fi
else
    test_result 1 "Dockerfile not found"
fi

if [ -f "docker-compose.yml" ]; then
    test_result 0 "Docker Compose file exists"
else
    test_result 1 "Docker Compose file not found"
fi

# Test 7: Performance Testing
echo "7. Testing Performance Testing Setup..."
if [ -f "artillery.yml" ]; then
    test_result 0 "Artillery config exists"
else
    test_result 1 "Artillery config not found"
fi

if [ -f "package.json" ] && grep -q "artillery" package.json; then
    test_result 0 "Artillery dependency configured"
else
    test_result 1 "Artillery dependency not found"
fi

# Test 8: Monitoring Configuration
echo "8. Testing Monitoring Configuration..."
if [ -d "monitoring" ]; then
    test_result 0 "Monitoring directory exists"
    if [ -f "monitoring/prometheus.yml" ]; then
        test_result 0 "Prometheus config exists"
    else
        test_result 1 "Prometheus config not found"
    fi
else
    test_result 1 "Monitoring directory not found"
fi

# Test 9: Application Health
echo "9. Testing Application Health..."
if npm test > /dev/null 2>&1; then
    test_result 0 "Application tests pass"
else
    test_result 1 "Application tests fail"
fi

# Test 10: Application Startup
echo "10. Testing Application Startup..."
timeout 10s bash -c 'npm start & sleep 3 && curl -f http://localhost:3000/health > /dev/null' && test_result 0 "Application starts and responds to health check" || test_result 1 "Application fails to start or health check fails"

# Summary
echo ""
echo "📊 Test Summary:"
echo "================"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! CD pipeline is ready for production.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review and fix issues before deploying.${NC}"
    exit 1
fi