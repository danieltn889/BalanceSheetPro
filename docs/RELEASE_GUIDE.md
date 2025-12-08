# Release & Tagging Guide

## Versioning
- Use Semantic Versioning: `MAJOR.MINOR.PATCH` (e.g., `v0.1.0`).
- Bump versions in `package.json` and create a matching git tag.

## Steps
```bash
# Ensure clean working tree
git checkout develop
git pull

# Merge into main via PR (recommended)
# Or fast-forward merge if allowed

# Update version
npm version 0.1.0 --no-git-tag-version

git add package.json
git commit -m "chore(release): v0.1.0"

git tag -a v0.1.0 -m "BalanceSheet Pro v0.1.0"

git push origin main --tags
```

## Docker Images
- GitHub Actions will build and push when a tag is pushed.
- Image name: `${DOCKERHUB_USERNAME}/balance-sheet-pro:<tag>`
- Latest convenience tag can be added manually:
```bash
docker tag ${DOCKERHUB_USERNAME}/balance-sheet-pro:v0.1.0 \
  ${DOCKERHUB_USERNAME}/balance-sheet-pro:latest

docker push ${DOCKERHUB_USERNAME}/balance-sheet-pro:latest
```

## Kubernetes Update
- Edit `image:` in `k8s/deployment.yaml` to the new tag and apply:
```bash
kubectl apply -f k8s/deployment.yaml
```

## Rollback
- Deploy previous tag by changing the image reference back.
