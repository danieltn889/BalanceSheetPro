# BalanceSheet Pro

A lightweight personal finance tracking API built with Node.js (Express.js). Perfect for demonstrating a complete DevOps pipeline.

## Features
- Track income, expenses, assets
- Compute monthly balance and cash flow
- Summary endpoint `/summary`
- Metrics endpoint `/metrics` for Prometheus

## Scripts
- `npm start` — run server
- `npm run dev` — run with nodemon
- `npm test` — run Jest tests
- `npm run lint` — lint with ESLint

## Performance Testing
This project includes comprehensive performance testing using [k6](https://k6.io/).

### Local Performance Testing
```bash
# Install k6 first (see https://k6.io/docs/get-started/installation/)
# On Ubuntu/Debian:
curl -fsSL https://k6.io/install.sh | bash
export PATH=$PATH:$HOME/.local/bin

# Start the application
npm start

# Run performance tests in another terminal
k6 run tests/performance.local.test.js
```

### CI/CD Performance Testing
Performance tests run automatically in the CI pipeline using the `grafana/k6-action`. The tests include:

- **Load Pattern**: 10 → 50 → 100 users over 4.5 minutes
- **Test Scenarios**: Authentication, CRUD operations, health checks
- **Performance Thresholds**:
  - 95% of requests < 500ms response time
  - Error rate < 10%

Results are uploaded as artifacts and summarized in GitHub Actions.

## Run Locally
```bash
npm ci
npm start
```

## Test
```bash
npm test
```

## Docker
```bash
docker build -t balancesheetpro:local .
docker run -p 3000:3000 balancesheetpro:local
```

## Kubernetes
Update image to your Docker Hub username in `k8s/deployment.yaml`.
```bash
kubectl apply -f k8s/deployment.yaml
```

## CI/CD
GitHub Actions workflow in `.github/workflows/ci.yml` runs lint/tests on PRs and publishes image on tags. Configure secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`.

See `docs/SLACK_SETUP.md` for complete setup instructions for Docker Hub and Slack integrations.

## Git Workflow
This project follows Git Flow branching strategy. See `docs/GIT_WORKFLOW.md` for detailed guidelines on:
- Branching strategy (main, develop, feature branches)
- Pull request process and code reviews
- Commit message standards (conventional commits)
- Release and hotfix procedures

## DevOps Roadmap & Policy
See `docs/DEVOPS_ROADMAP.md` for roadmap, error budget, and branching strategy.
# Test commit for CI workflow
# Test commit for CI workflow
# Additional test commit
