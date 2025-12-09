#!/bin/bash

# Test Slack Notifications for BalanceSheetPro Monitoring
# This script tests the Slack webhook integration

echo "🔔 Testing Slack Notifications"
echo "================================"

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

if [ -z "$SLACK_WEBHOOK_URL" ] || [ "$SLACK_WEBHOOK_URL" = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" ]; then
    echo "❌ SLACK_WEBHOOK_URL not configured!"
    echo ""
    echo "📋 To set up Slack notifications:"
    echo "1. Go to https://YOUR_WORKSPACE.slack.com/apps"
    echo "2. Search for 'Incoming WebHooks' and install"
    echo "3. Create a new webhook for your channel"
    echo "4. Copy the webhook URL and update your .env file:"
    echo ""
    echo "   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/ACTUAL/WEBHOOK"
    echo ""
    echo "5. Restart your monitoring stack:"
    echo "   docker compose down && docker compose up -d"
    exit 1
fi

echo "✅ Slack webhook URL configured"

# Function to send test message
send_slack_message() {
    local message="$1"
    local color="${2:-good}"

    local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "$color",
      "title": "BalanceSheetPro Monitoring Test",
      "text": "$message",
      "fields": [
        {
          "title": "Environment",
          "value": "Development",
          "short": true
        },
        {
          "title": "Time",
          "value": "$(date)",
          "short": true
        }
      ],
      "footer": "BalanceSheetPro Monitoring",
      "ts": $(date +%s)
    }
  ]
}
EOF
)

    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H 'Content-type: application/json' \
        "$SLACK_WEBHOOK_URL" \
        -d "$payload")

    if [ "$response" = "200" ]; then
        echo "✅ Message sent successfully"
        return 0
    else
        echo "❌ Failed to send message (HTTP $response)"
        return 1
    fi
}

# Test different notification types
echo ""
echo "📤 Sending test notifications..."

echo "1. Success notification:"
send_slack_message "✅ Monitoring system is working correctly!" "good"

echo ""
echo "2. Warning notification:"
send_slack_message "⚠️ High latency detected: P95 = 650ms" "warning"

echo ""
echo "3. Critical alert notification:"
send_slack_message "🚨 CRITICAL: Service is down! Immediate attention required." "danger"

echo ""
echo "4. Info notification:"
send_slack_message "ℹ️ System health check completed successfully" "#439FE0"

echo ""
echo "🎉 Slack notification testing completed!"
echo ""
echo "📱 Check your Slack channel for the test messages."
echo "💡 If you don't see them, verify your webhook URL is correct."