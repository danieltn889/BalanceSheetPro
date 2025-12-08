# Git Workflow Guidelines

## Branching Strategy

This project follows a Git Flow branching model with the following branches:

- `main` - Production-ready code, always deployable
- `develop` - Integration branch for features, latest development changes
- `feature/*` - Feature branches for new functionality
- `hotfix/*` - Hotfix branches for critical production fixes

## Workflow

### Feature Development

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make commits with conventional commit messages:
   ```bash
   git commit -m "feat: add user authentication"
   git commit -m "fix: resolve login validation bug"
   git commit -m "docs: update API documentation"
   ```

3. Push feature branch and create pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create pull request from `feature/your-feature-name` to `develop`

### Pull Request Process

- **Title**: Use conventional commit format (feat:, fix:, docs:, etc.)
- **Description**: Include what was changed and why
- **Reviewers**: Assign at least one reviewer
- **Labels**: Add appropriate labels (enhancement, bug, documentation)

### Code Review Guidelines

- Reviewers should check:
  - Code quality and style
  - Test coverage
  - Documentation updates
  - Breaking changes
- Use GitHub's review features:
  - Comment on specific lines
  - Request changes if needed
  - Approve when ready

### Merging

- Use "Squash and merge" for feature branches
- Delete feature branches after merge
- Never force push to `main` or `develop`

## Commit Message Standards

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat: add loan tracking functionality
fix: resolve balance calculation error
docs: update deployment instructions
refactor: simplify authentication logic
test: add unit tests for expense validation
```

## Release Process

1. Merge approved features to `develop`
2. Create release branch from `develop`
3. Test and finalize release
4. Merge release branch to `main`
5. Tag release with semantic version (v1.0.0)
6. Deploy to production

## Hotfixes

1. Create hotfix branch from `main`
2. Fix the issue
3. Merge back to both `main` and `develop`
4. Tag if necessary