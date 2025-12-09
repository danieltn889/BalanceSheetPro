# BalanceSheet Pro - Complete DevOps Pipeline Project

A comprehensive DevOps demonstration project featuring a Node.js financial tracking API with full CI/CD pipeline, monitoring, alerting, and automated deployment.

## 📋 Project Overview

**BalanceSheet Pro** is a lightweight personal finance tracking API built with Node.js and Express.js. This project demonstrates a complete DevOps pipeline from development to production deployment, including:

- ✅ **CI/CD Pipeline** with GitHub Actions
- ✅ **Containerization** with Docker
- ✅ **Orchestration** with Kubernetes
- ✅ **Monitoring** with Prometheus/Grafana
- ✅ **Logging** with ELK Stack
- ✅ **Alerting** with automated response
- ✅ **Performance Testing** with Artillery and k6
- ✅ **Security Scanning** and code quality checks

## 🏗️ Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions │───▶│   Docker Hub    │
│                 │    │   CI/CD Pipeline │    │   Registry      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Local Testing  │    │   Performance   │    │   Kubernetes    │
│   (Jest/Mocha)  │    │     Testing     │    │   Deployment    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING STACK                         │
├─────────────────┬─────────────────┬─────────────────┬───────┤
│   Prometheus    │    Grafana      │   Alertmanager  │ ELK   │
│   (Metrics)     │   (Dashboards)  │   (Alerting)    │ Stack │
└─────────────────┴─────────────────┴─────────────────┴───────┘
```

## 🚀 Pipeline Phases

### Phase 1: Plan
- **Requirements**: Personal finance API with CRUD operations
- **Architecture**: Node.js + Express.js + SQLite
- **DevOps Strategy**: Git Flow, automated testing, containerization

### Phase 2: Code
- **Framework**: Node.js with Express.js
- **Database**: SQLite for simplicity
- **Testing**: Jest for unit tests
- **Linting**: ESLint for code quality

### Phase 3: Build
- **Containerization**: Docker multi-stage builds
- **CI Pipeline**: GitHub Actions with parallel jobs
- **Quality Gates**: Security scanning, code quality, unit tests

### Phase 4: Test
- **Performance Testing**: Artillery for load testing (900 requests, P95 < 500ms)
- **Integration Testing**: Docker Compose for service testing
- **Automated Testing**: Runs on every push to main branch

### Phase 5: Release
- **Artifact Management**: Docker Hub for image registry
- **Versioning**: Semantic versioning with Git tags
- **Release Automation**: GitHub Actions releases

### Phase 6: Deploy
- **Orchestration**: Kubernetes with rolling deployments
- **Environment**: Staging and production environments
- **Blue-Green Deployment**: Optional deployment strategy

### Phase 7: Operate
- **Monitoring**: Prometheus for metrics collection
- **Visualization**: Grafana dashboards for metrics
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Alerting**: Alertmanager with automated response via GitHub Actions

## 🛠️ Tools & Technologies

| Category | Tools | Purpose |
|----------|-------|---------|
| **Version Control** | Git, GitHub | Source code management |
| **CI/CD** | GitHub Actions | Automated pipeline |
| **Containerization** | Docker | Application packaging |
| **Orchestration** | Kubernetes | Container orchestration |
| **Monitoring** | Prometheus, Grafana | Metrics collection & visualization |
| **Logging** | ELK Stack | Centralized logging |
| **Alerting** | Alertmanager | Alert management |
| **Testing** | Jest, Artillery, k6 | Unit & performance testing |
| **Security** | npm audit | Dependency vulnerability scanning |
| **Code Quality** | ESLint | Code linting |
| **Notifications** | Slack | Pipeline notifications |

## 📊 Performance Metrics & Error Budget

### Performance Targets
- **Response Time**: P95 < 500ms for all requests
- **Error Rate**: < 10% of total requests
- **Availability**: 99.9% uptime (8.77 hours downtime/year)
- **Throughput**: Handle 900+ concurrent requests

### Current Performance Results
- ✅ **P95 Response Time**: 156ms (Target: < 500ms)
- ✅ **Error Rate**: 0% (Target: < 10%)
- ✅ **Total Requests**: 900 handled successfully
- ✅ **Availability**: 100% during testing

### Error Budget Calculation
```
Monthly Error Budget = (100% - 99.9%) × 30 days × 24 hours = 7.2 hours
Daily Error Budget = 7.2 hours ÷ 30 days = 14.4 minutes
Hourly Error Budget = 14.4 minutes ÷ 24 hours = 36 seconds
```

## 🖥️ Screenshots & Evidence

### CI/CD Pipeline Execution
```
✅ Security Scan: PASSED
✅ Code Quality Check: PASSED
✅ Docker Build: PASSED
✅ Unit Tests: PASSED
✅ Performance Test: PASSED | P95: 156ms | Error: 0% | Req: 900
🚀 CI/CD Pipeline Complete
Staging Deployment: SUCCESS
Docker Publish: SUCCESS
```

### Monitoring Dashboard (Grafana)
- **Application Metrics**: HTTP request rates, response times, error rates
- **System Metrics**: CPU usage, memory usage, disk I/O
- **Container Metrics**: Docker container performance
- **Custom Dashboards**: Business metrics and SLO tracking

### Alerting System
- **Critical Alerts**: Service down, high error rate (>10%)
- **Warning Alerts**: High latency, resource usage
- **Automated Response**: GitHub Actions triggered for incident response
- **Notifications**: Slack integration for real-time alerts

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- kubectl (for Kubernetes deployment)
- GitHub account with repository

### Local Development
```bash
# Clone repository
git clone https://github.com/danieltn889/BalanceSheetPro.git
cd BalanceSheetPro

# Install dependencies
npm ci

# Run locally
npm start

# Run tests
npm test

# Run with Docker
docker build -t balancesheetpro:local .
docker run -p 3000:3000 balancesheetpro:local
```

### CI/CD Pipeline
The pipeline runs automatically on pushes to `main` branch:

1. **Quality Checks**: Security scan, linting, unit tests
2. **Build**: Docker image creation
3. **Test**: Performance testing with Artillery
4. **Deploy**: Kubernetes deployment to staging
5. **Publish**: Docker image push to Docker Hub
6. **Release**: GitHub release creation

### Monitoring Setup
```bash
# Start monitoring stack
docker compose up -d

# Access points:
# - Application: http://localhost:3000
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
# - Kibana: http://localhost:5601
```

## 📈 Resource Calculations

### Development Environment
- **CPU**: 2 cores minimum
- **Memory**: 4GB RAM
- **Storage**: 10GB disk space
- **Network**: Standard internet connection

### Production Environment (Kubernetes)
- **Pods**: 3 replicas (for high availability)
- **CPU Request**: 100m per pod
- **CPU Limit**: 500m per pod
- **Memory Request**: 128Mi per pod
- **Memory Limit**: 512Mi per pod
- **Storage**: 1GB for database, 5GB for logs

### Monitoring Stack Resources
- **Prometheus**: 1GB RAM, 2GB storage
- **Grafana**: 512MB RAM, 1GB storage
- **Elasticsearch**: 2GB RAM, 10GB storage
- **Logstash**: 1GB RAM
- **Kibana**: 512MB RAM

## 🔧 Configuration

### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key

# Database
DATABASE_PATH=./data/balancesheet.db

# Monitoring
GITHUB_TOKEN=your_github_token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
```

### GitHub Secrets (Repository Settings → Secrets)
- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token
- `SLACK_WEBHOOK_URL`: Slack webhook URL
- `SLACK_BOT_TOKEN`: Slack bot token
- `SLACK_CHANNEL_ID`: Slack channel ID

## 📚 Documentation

- `docs/DEVOPS_ROADMAP.md` - Development roadmap and policies
- `docs/GIT_WORKFLOW.md` - Git branching strategy
- `docs/SLACK_SETUP.md` - Slack integration setup
- `docs/RELEASE_GUIDE.md` - Release procedures
- `monitoring/README.md` - Monitoring stack documentation

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |
| POST | `/auth/login` | User authentication |
| GET | `/income` | Get income records |
| POST | `/income` | Add income record |
| GET | `/expenses` | Get expense records |
| POST | `/expenses` | Add expense record |
| GET | `/summary` | Get financial summary |

## 📝 Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run perf:artillery` | Run Artillery performance tests |
| `./scripts/test-alert-feedback.sh` | Test alert response system |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or issues:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review CI/CD pipeline logs for troubleshooting

---

**GitHub Repository**: https://github.com/danieltn889/BalanceSheetPro
**Docker Hub**: https://hub.docker.com/r/[username]/balance-sheet-pro

*This project demonstrates a complete DevOps pipeline suitable for production deployment with enterprise-grade monitoring and alerting.*
