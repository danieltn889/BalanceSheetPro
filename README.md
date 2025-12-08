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
GitHub Actions workflow in `.github/workflows/ci.yml` runs lint/tests on PRs and publishes image on tags. Configure secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Git Workflow
This project follows Git Flow branching strategy. See `docs/GIT_WORKFLOW.md` for detailed guidelines on:
- Branching strategy (main, develop, feature branches)
- Pull request process and code reviews
- Commit message standards (conventional commits)
- Release and hotfix procedures

## DevOps Roadmap & Policy
See `docs/DEVOPS_ROADMAP.md` for roadmap, error budget, and branching strategy.
