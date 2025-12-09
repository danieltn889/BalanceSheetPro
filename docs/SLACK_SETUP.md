# CI/CD Secrets Setup Guide

This guide explains how to set up Docker Hub and Slack integrations for your BalanceSheet Pro CI/CD pipeline.

## 🔐 Why These Secrets Are Needed

### Docker Hub Secrets
- **DOCKERHUB_USERNAME**: Your Docker Hub username
- **DOCKERHUB_TOKEN**: Personal access token for authentication
- **Purpose**: Automatically publish Docker images when you create Git tags (releases)
- **Security**: Never commit these to code - always use GitHub secrets

### Slack Secrets
- **SLACK_BOT_TOKEN**: Bot token for posting messages
- **SLACK_CHANNEL_ID**: Channel where notifications are sent
- **Purpose**: Get instant notifications about CI/CD results (success/failure/coverage)

## 🐳 Docker Hub Setup

### 1. Create Docker Hub Account
1. Go to [Docker Hub](https://hub.docker.com)
2. Sign up for a free account if you don't have one

### 2. Generate Access Token
1. Login to Docker Hub
2. Go to Account Settings → Security → Access Tokens
3. Click "Generate Token"
4. Name it "BalanceSheet Pro CI"
5. Copy the token (you won't see it again!)

### 3. Add to GitHub Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: The token you just created

## 📢 Slack Setup

### 1. Create Slack App
1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name: "BalanceSheet Pro CI"
4. Select your workspace

### 2. Configure Bot Permissions
1. In app settings, go to "OAuth & Permissions"
2. Under "Scopes", add: `chat:write`
3. Click "Install to Workspace"
4. Grant permissions

### 3. Get Bot Token
1. In "OAuth & Permissions" page
2. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 4. Get Channel ID
1. In Slack, right-click the channel name
2. Click "Copy link"
3. The ID is the last part: `C1234567890`

### 5. Add to GitHub Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add:
   - `SLACK_BOT_TOKEN`: The bot token
   - `SLACK_CHANNEL_ID`: The channel ID

## ✅ Verification

### Test Docker Hub
1. Create a git tag: `git tag v0.1.0 && git push origin v0.1.0`
2. Check GitHub Actions tab for the workflow run
3. Verify image appears on Docker Hub

### Test Slack
1. Push a commit to trigger CI
2. Check your Slack channel for notifications

## 🔒 Security Best Practices

- ✅ Use GitHub secrets (never commit tokens to code)
- ✅ Use personal access tokens instead of passwords
- ✅ Regularly rotate tokens
- ✅ Limit bot permissions to only what's needed
- ✅ Monitor token usage

## � Required Secrets Summary

| Secret | Purpose | Where to Get |
|--------|---------|--------------|
| `DOCKERHUB_USERNAME` | Docker Hub login | Your Docker Hub account |
| `DOCKERHUB_TOKEN` | Docker Hub auth | Docker Hub → Account Settings → Security |
| `SLACK_BOT_TOKEN` | Slack messaging | Slack API → Your App → OAuth & Permissions |
| `SLACK_CHANNEL_ID` | Slack channel | Slack → Copy channel link |

Once set up, your CI/CD pipeline will automatically:
- 🐳 Publish Docker images on releases
- 📢 Send Slack notifications for all builds

## 🚨 Troubleshooting

### Docker Hub Issues
- **"denied: access forbidden"**: Check `DOCKERHUB_TOKEN` is correct and has write permissions
- **"repository not found"**: Ensure `DOCKERHUB_USERNAME` matches your Docker Hub account

### Slack Issues
- **"missing_scope"**: Ensure bot has `chat:write` permission
- **"channel_not_found"**: Verify `SLACK_CHANNEL_ID` is correct (should start with 'C')
- **No notifications**: Check if bot is invited to the channel

### Common Mistakes
- Using password instead of access token for Docker Hub
- Forgetting to install Slack app to workspace
- Using wrong channel ID format
- Not setting secrets in GitHub repository settings

## 📞 Support
If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are set correctly
3. Test tokens manually if possible
4. Check Slack app configuration
2. The channel ID is the last part of the URL (e.g., `C1234567890`)

### 4. Add Secrets to GitHub
In your repository settings → Secrets and variables → Actions:
- `SLACK_BOT_TOKEN`: Your bot token
- `SLACK_CHANNEL_ID`: Your channel ID

## Notification Types
- **CI Success**: Green checkmark when tests pass
- **CI Failure**: Red X with link to failed run details
- **Docker Publish**: Confirmation when image is pushed to Docker Hub

## Example Messages
```
✅ CI passed for BalanceSheet Pro - Branch: `main` Commit: `abc123`
❌ CI failed for BalanceSheet Pro - Branch: `develop` Commit: `def456` [View Details](link)
✅ Docker image published successfully: `username/balance-sheet-pro:v1.0.0`
```