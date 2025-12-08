# DevOps Roadmap for BalanceSheet Pro

Phases and tools:
- Plan: GitHub Projects, Draw.io
- Code: Node.js, Git branching (feature/develop/main), PR reviews
- Build: GitHub Actions, Docker multi-stage
- Test: Jest, Supertest, automated in CI with coverage reporting, Slack notifications
- Release: Semantic versioning, Git tags, Docker Hub push
- Deploy: Kubernetes (Deployment, Service), rolling updates
- Operate: Prometheus metrics endpoint `/metrics`, Grafana dashboards
- Monitor: Alerts based on error budget; HPA for scaling

## Error Budget Policy
- Target availability: 99.9% monthly
- Error budget: 0.1% (~43.2 minutes/month)
- Alerts:
  - Latency p95 > 500ms for 5m
  - Availability < 99% over 15m
  - Pod restart count > threshold

## Branching Strategy & Workflow
- Branches: `main` (stable), `develop` (integration), `feature/*`
- PRs required into `develop` and `main` with 1 review
- Commit convention: `type(scope): message` (e.g., `feat(api): add assets route`)
- Protected branches: no direct pushes to `main`
