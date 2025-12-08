# Slack Notifications Setup

## Overview
The CI/CD pipeline includes Slack notifications for build and test results, providing immediate feedback to the team.

## Setup Steps

### 1. Create Slack App
1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "BalanceSheet Pro CI") and select workspace

### 2. Configure Bot Token
1. In your app settings, go to "OAuth & Permissions"
2. Add bot token scopes: `chat:write`
3. Install the app to your workspace
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 3. Get Channel ID
1. In Slack, right-click the channel → "Copy link"
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