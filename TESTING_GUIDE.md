# 📸 Complete Testing & Screenshot Guide for Moodle Assignment

## 🎯 Testing Objectives
Test your complete DevOps pipeline and capture evidence for submission.

## 📋 Pre-Testing Checklist

### ✅ Repository Setup
- [ ] GitHub repository: https://github.com/danieltn889/BalanceSheetPro
- [ ] All code committed and pushed
- [ ] CI/CD pipeline configured
- [ ] Docker Hub access configured
- [ ] Slack notifications (optional)

### ✅ Local Environment
- [ ] Node.js 20.x installed
- [ ] Docker & Docker Compose installed
- [ ] kubectl installed (optional)
- [ ] Git configured

---

## 🧪 TESTING PLAN

### Phase 1: Local Development Testing

#### 1.1 Application Testing
```bash
# Test 1: Start Application Locally
cd BalanceSheetPro
npm ci
npm start

# Screenshot: Terminal showing "Server running on port 3000"
# Screenshot: Browser http://localhost:3000 showing app running
```

#### 1.2 API Testing
```bash
# Test 2: Test API Endpoints
curl http://localhost:3000/health
curl http://localhost:3000/metrics

# Screenshot: API responses in terminal
# Screenshot: Postman/Insomnia testing API endpoints
```

#### 1.3 Docker Testing
```bash
# Test 3: Build and Run Docker Container
docker build -t balancesheetpro:local .
docker run -p 3000:3000 balancesheetpro:local

# Screenshot: Docker build output
# Screenshot: Container running
```

### Phase 2: CI/CD Pipeline Testing

#### 2.1 Trigger Pipeline
```bash
# Test 4: Push Code to Trigger CI/CD
git add .
git commit -m "Test commit for CI pipeline"
git push origin main

# Screenshot: GitHub Actions tab showing pipeline running
```

#### 2.2 Monitor Pipeline Execution
```
# Screenshots to capture:
1. GitHub Actions → Your repository → Actions tab
2. Pipeline jobs: quality, security, docker_test, perf_test, staging, publish, release
3. Each job's logs and status
4. Performance test results
5. Docker Hub showing published image
```

### Phase 3: Monitoring Stack Testing

#### 3.1 Start Monitoring
```bash
# Test 5: Start Monitoring Stack
docker compose -f monitoring/docker-compose.yml up -d

# Screenshot: Docker containers running (Prometheus, Grafana, etc.)
```

#### 3.2 Access Dashboards
```
# Screenshots to capture:
1. Prometheus: http://localhost:9090
2. Grafana: http://localhost:3001 (admin/admin)
3. Kibana: http://localhost:5601
4. Application metrics in Grafana dashboard
```

#### 3.3 Test Alerting
```bash
# Test 6: Test Alert System
./scripts/test-alert-feedback.sh

# Screenshot: Alert webhook responses
# Screenshot: Slack notifications (if configured)
```

### Phase 4: Kubernetes Deployment Testing (Optional)

#### 4.1 Deploy to Kubernetes
```bash
# Test 7: Deploy to K8s (if cluster available)
kubectl apply -f k8s/deployment.yaml
kubectl get pods

# Screenshot: kubectl deployment status
# Screenshot: Kubernetes dashboard
```

---

## 📸 SCREENSHOT CAPTURE GUIDE

### Essential Screenshots for Moodle Assignment

#### 1. **Repository Overview**
- GitHub repository homepage
- Repository description and topics
- Stars, forks, watchers count
- Releases page (28 releases)

#### 2. **CI/CD Pipeline**
- GitHub Actions workflow runs
- Pipeline job statuses (all green checks)
- Performance test results (P95: 156ms, 0% error)
- Docker build and publish logs
- Release creation

#### 3. **Code Quality**
- ESLint results (no errors)
- npm audit results (security scan passed)
- Jest test results (all tests passing)

#### 4. **Docker & Containerization**
- Docker build output
- Docker Hub repository with published images
- Container running logs

#### 5. **Monitoring Dashboards**
- Grafana dashboard with metrics
- Prometheus targets and metrics
- Alertmanager configuration
- Kibana logs visualization

#### 6. **Application Screenshots**
- Application running locally
- API endpoints working
- Health check responses
- Metrics endpoint output

#### 7. **Kubernetes Deployment** (if applicable)
- kubectl deployment status
- Pod logs
- Service endpoints
- Resource usage

#### 8. **Alerting System**
- Alert webhook test results
- Slack notification examples
- Automated response logs

---

## 📄 PDF REPORT GENERATION

### Step 1: Generate PDF from Report
```bash
# Install Pandoc (Ubuntu/Debian)
sudo apt update
sudo apt install pandoc texlive-latex-base texlive-fonts-recommended

# Convert to PDF
pandoc REPORT.md -o BalanceSheetPro_Report.pdf --pdf-engine=pdflatex
```

### Step 2: Verify PDF Content
- [ ] All 12 sections included
- [ ] Architecture diagrams present
- [ ] Screenshots embedded or described
- [ ] Resource tables included
- [ ] Performance metrics documented
- [ ] Under 10 pages

---

## 📤 MOODLE SUBMISSION PACKAGE

### Required Files:
1. **BalanceSheetPro_Report.pdf** (max 10 pages)
2. **Repository Link:** https://github.com/danieltn889/BalanceSheetPro

### PDF Structure Checklist:
- [ ] Title page with your details
- [ ] Table of contents
- [ ] Project overview
- [ ] Architecture diagram
- [ ] Pipeline phases explanation
- [ ] Tools and technologies table
- [ ] Setup and configuration
- [ ] CI/CD execution screenshots
- [ ] Performance testing results
- [ ] Monitoring screenshots
- [ ] Resource calculations
- [ ] Challenges and solutions
- [ ] Conclusion

---

## 🧪 QUICK TESTING SCRIPT

Run this to test everything at once:

```bash
#!/bin/bash
echo "🧪 BalanceSheet Pro - Complete Testing Suite"
echo "==========================================="

# Test 1: Local Application
echo "1. Testing Local Application..."
npm ci && npm start &
sleep 5
curl -s http://localhost:3000/health && echo "✅ App running" || echo "❌ App failed"
pkill -f "node src/server.js"

# Test 2: Docker Build
echo "2. Testing Docker Build..."
docker build -t test-image . && echo "✅ Docker build successful" || echo "❌ Docker build failed"

# Test 3: Unit Tests
echo "3. Testing Unit Tests..."
npm test && echo "✅ Tests passed" || echo "❌ Tests failed"

# Test 4: Performance Tests
echo "4. Testing Performance..."
npm run perf:artillery && echo "✅ Performance tests passed" || echo "❌ Performance tests failed"

# Test 5: Monitoring Stack
echo "5. Testing Monitoring Stack..."
docker compose -f monitoring/docker-compose.yml up -d
sleep 10
curl -s http://localhost:9090/-/ready && echo "✅ Prometheus ready" || echo "❌ Prometheus failed"
curl -s http://localhost:3001/api/health && echo "✅ Grafana ready" || echo "❌ Grafana failed"

echo "🎉 Testing complete! Check screenshots above."
```

---

## 📊 SUCCESS CRITERIA

### Pipeline Success Indicators:
- ✅ All GitHub Actions jobs pass (green checks)
- ✅ Performance tests: P95 < 500ms, Error rate < 10%
- ✅ Docker image published to Docker Hub
- ✅ Monitoring dashboards accessible
- ✅ Application health checks pass
- ✅ 28+ releases created
- ✅ Deployment to production environment

### Evidence Captured:
- 📸 15+ screenshots of different pipeline stages
- 📊 Performance metrics and graphs
- 📋 Configuration files and scripts
- 📝 Comprehensive documentation
- 🔗 Working repository link

---

## 🚀 FINAL CHECKLIST

Before submission:
- [ ] All tests pass locally
- [ ] CI/CD pipeline runs successfully
- [ ] Docker images published
- [ ] Monitoring stack functional
- [ ] PDF report generated and formatted
- [ ] All screenshots captured
- [ ] Repository link accessible
- [ ] Assignment requirements met

**Ready to submit!** 🎓

Run the testing script and capture screenshots as you go through each phase.