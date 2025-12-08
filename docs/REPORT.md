# BalanceSheet Pro — DevOps Pipeline Report

Author: <Your Name>
Date: 2025-12-08

## 1. Architecture Diagram
- See `docs/diagram.drawio` (export to PNG for the PDF).
- Components: Developer → GitHub → CI (Actions) → Docker Hub → Kubernetes (Deployment/Service/HPA) → Monitoring (Prometheus/Grafana).

## 2. Scope & Requirements
- Node.js (Express) API: income, expenses, assets, summary.
- CI: lint + test on PR; publish image on tag.
- CD: Kubernetes with rolling updates, HPA.
- Monitoring: Prometheus metrics endpoint; Grafana dashboards.
- Error Budget: 99.9% monthly (43.2 min budget).

## 3. Plan (Roadmap)
- See `docs/DEVOPS_ROADMAP.md` for phase mapping and policies.

## 4. Code & Branching Strategy
- Branches: `main`, `develop`, `feature/*`.
- PRs required, 1 review minimum.
- Commit convention: `type(scope): message`.

## 5. Build & Containerization
- Multi-stage `Dockerfile` with Node 20 Alpine.
- `npm ci` in CI, `npm test`.

## 6. Tests
- Jest + Supertest integration tests: `/summary`, `/income`, `/expenses`, `/assets`, `/loans` endpoints
- 12 comprehensive test cases covering CRUD operations and validation
- Automated test execution in CI pipeline with coverage reporting
- Slack notifications for test results (success/failure)
- Test coverage: 85.43% statement coverage
- Results: All tests passing

## 7. Release
- Tag format: `v0.1.0`.
- See `docs/RELEASE_GUIDE.md` for steps.

## 8. Deploy
- `k8s/deployment.yaml`: rolling update, requests/limits, probes.
- `Service` and `HPA` included.

## 9. Operate & Monitor
- `/metrics` endpoint for Prometheus scrape.
- Suggested Grafana dashboards for HTTP latency and request rate.
- Alerts: latency p95 > 500ms 5m; availability < 99% 15m.

## 10. Evidence (Screenshots Placeholders)
- CI run success screenshot.
- Docker Hub image pushed screenshot.
- `kubectl get deploy/pods` showing rollout.
- Grafana dashboard screenshot.

## 11. Resource Calculation Table
| Component | CPU request | CPU limit | Mem request | Mem limit |
|----------|-------------|-----------|-------------|-----------|
| API Pod  | 100m        | 500m      | 128Mi       | 256Mi     |

## 12. How to Reproduce
```bash
# Local
npm install
npm start

# Test
npm test

# Build Docker
docker build -t <user>/balance-sheet-pro:local .
docker run -p 3000:3000 <user>/balance-sheet-pro:local

# Kubernetes
kubectl apply -f k8s/deployment.yaml
```

## 13. Notes
- Replace placeholders (`<Your Name>`, `<user>`, Docker Hub username).
- Export this Markdown to PDF for Moodle submission.
