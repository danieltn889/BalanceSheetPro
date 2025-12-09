#!/bin/bash

# Test script for Alert Response Feedback Loop
# This script simulates different alert scenarios to test the automated response system

set -e

echo "🧪 Testing Alert Response Feedback Loop"
echo "========================================"

# Configuration
WEBHOOK_URL="http://localhost:3000/webhook/alert"
WEBHOOK_USER="${WEBHOOK_USERNAME:-webhook}"
WEBHOOK_PASS="${WEBHOOK_PASSWORD:-password}"

# Function to send test alert
send_test_alert() {
    local alert_type="$1"
    local severity="$2"
    local description="$3"

    echo "📤 Sending test alert: $alert_type ($severity)"

    local payload=$(cat <<EOF
{
  "alerts": [
    {
      "labels": {
        "alertname": "$alert_type",
        "severity": "$severity"
      },
      "annotations": {
        "description": "$description",
        "summary": "$alert_type detected"
      },
      "status": "firing",
      "value": "85",
      "startsAt": "$(date -Iseconds)"
    }
  ]
}
EOF
)

    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -u "$WEBHOOK_USER:$WEBHOOK_PASS" \
        "$WEBHOOK_URL" \
        -d "$payload")

    if [ "$response" = "200" ]; then
        echo "✅ Alert sent successfully (HTTP $response)"
    else
        echo "❌ Failed to send alert (HTTP $response)"
    fi
}

# Test different alert scenarios
echo "1. Testing High Error Rate (Critical)..."
send_test_alert "HighErrorRate" "critical" "Error rate is 15% (threshold: 10%)"

echo ""
echo "2. Testing Service Down (Critical)..."
send_test_alert "ServiceDown" "critical" "Balance Sheet Pro service is down"

echo ""
echo "3. Testing High Latency (Warning)..."
send_test_alert "HighLatency" "warning" "P95 latency is 650ms (threshold: 500ms)"

echo ""
echo "4. Testing Database Issues (Warning)..."
send_test_alert "DatabaseConnectionIssues" "warning" "Database connection errors detected"

echo ""
echo "🎉 Alert testing completed!"
echo ""
echo "📋 Check the following to verify the feedback loop:"
echo "   - GitHub Actions: https://github.com/$GITHUB_REPOSITORY/actions"
echo "   - Application logs for webhook processing"
echo "   - Slack notifications (if configured)"
echo "   - GitHub issues for incident tracking"