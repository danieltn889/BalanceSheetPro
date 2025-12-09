#!/bin/bash

# BalanceSheet Pro - Complete Testing Suite
# Run this script to test your entire DevOps pipeline

echo "🧪 BalanceSheet Pro - Complete Testing Suite"
echo "==========================================="
echo "Testing Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Test 1: Check repository structure
echo "1. 📁 Checking Repository Structure..."
if [ -f "package.json" ] && [ -f "README.md" ] && [ -d ".github/workflows" ]; then
    print_status "success" "Repository structure is correct"
else
    print_status "error" "Repository structure incomplete"
fi

# Test 2: Local Application
echo ""
echo "2. 🚀 Testing Local Application..."
if npm ci 2>/dev/null; then
    print_status "success" "Dependencies installed"
else
    print_status "error" "Failed to install dependencies"
    exit 1
fi

# Start app in background
npm start &
APP_PID=$!
sleep 5

# Test health endpoint
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    print_status "success" "Application is running (http://localhost:3000)"
else
    print_status "error" "Application failed to start"
fi

# Test metrics endpoint
if curl -s http://localhost:3000/metrics > /dev/null 2>&1; then
    print_status "success" "Metrics endpoint working"
else
    print_status "warning" "Metrics endpoint not accessible"
fi

# Stop app
kill $APP_PID 2>/dev/null
sleep 2

# Test 3: Unit Tests
echo ""
echo "3. 🧪 Running Unit Tests..."
if npm test 2>/dev/null; then
    print_status "success" "All unit tests passed"
else
    print_status "error" "Unit tests failed"
fi

# Test 4: Docker Build
echo ""
echo "4. 🐳 Testing Docker Build..."
if docker build -t balancesheetpro:test . 2>/dev/null; then
    print_status "success" "Docker build successful"
else
    print_status "error" "Docker build failed"
fi

# Test 5: Docker Run
echo ""
echo "5. 🐳 Testing Docker Container..."
docker run -d --name test-container -p 3001:3000 balancesheetpro:test
sleep 5

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_status "success" "Docker container running successfully"
else
    print_status "error" "Docker container failed"
fi

# Cleanup
docker stop test-container 2>/dev/null
docker rm test-container 2>/dev/null

# Test 6: Performance Tests
echo ""
echo "6. ⚡ Running Performance Tests..."
if npm run perf:artillery 2>/dev/null; then
    print_status "success" "Performance tests completed"
else
    print_status "warning" "Performance tests had issues (check manually)"
fi

# Test 7: Monitoring Stack
echo ""
echo "7. 📊 Testing Monitoring Stack..."
cd monitoring
if docker compose up -d 2>/dev/null; then
    print_status "success" "Monitoring stack started"
    sleep 10

    # Test Prometheus
    if curl -s http://localhost:9090/-/ready > /dev/null 2>&1; then
        print_status "success" "Prometheus is ready"
    else
        print_status "warning" "Prometheus not accessible"
    fi

    # Test Grafana
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_status "success" "Grafana is ready"
    else
        print_status "warning" "Grafana not accessible"
    fi

    # Stop monitoring stack
    docker compose down 2>/dev/null
else
    print_status "warning" "Monitoring stack failed to start"
fi
cd ..

# Test 8: CI/CD Pipeline Trigger
echo ""
echo "8. 🚀 CI/CD Pipeline Status..."
echo "   To test CI/CD pipeline:"
echo "   1. Make a small change to any file"
echo "   2. git add . && git commit -m 'Test CI pipeline'"
echo "   3. git push origin main"
echo "   4. Check GitHub Actions tab for pipeline execution"
print_status "info" "CI/CD testing requires manual trigger (see instructions above)"

# Summary
echo ""
echo "🎉 TESTING COMPLETE!"
echo "==================="
echo ""
echo "📸 Screenshots to Capture:"
echo "1. ✅ This terminal output (all tests)"
echo "2. 🌐 Browser: http://localhost:3000 (when app running)"
echo "3. 🐳 Docker Hub: Your published images"
echo "4. ⚙️ GitHub Actions: Pipeline execution"
echo "5. 📊 Grafana: http://localhost:3001 (admin/admin)"
echo "6. 📈 Prometheus: http://localhost:9090"
echo "7. 🔍 Kibana: http://localhost:5601"
echo ""
echo "📄 Generate PDF Report:"
echo "pandoc REPORT.md -o BalanceSheetPro_Report.pdf --pdf-engine=pdflatex"
echo ""
echo "📤 Submit to Moodle:"
echo "- PDF Report (max 10 pages)"
echo "- Repository Link: https://github.com/danieltn889/BalanceSheetPro"
echo ""
echo "🎓 Good luck with your assignment!"