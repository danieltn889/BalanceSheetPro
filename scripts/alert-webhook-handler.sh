#!/bin/bash

# Alert Webhook Handler for GitHub Actions Integration
# This script processes Alertmanager webhooks and triggers GitHub Actions workflows

set -e

# Configuration - these should be set as environment variables or secrets
GITHUB_TOKEN="${GITHUB_TOKEN}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-danieltn889/BalanceSheetPro}"
WEBHOOK_USERNAME="${WEBHOOK_USERNAME:-webhook}"
WEBHOOK_PASSWORD="${WEBHOOK_PASSWORD:-password}"

# Function to trigger GitHub repository dispatch
trigger_github_workflow() {
    local alert_type="$1"
    local severity="$2"
    local description="$3"
    local value="$4"

    echo "🚀 Triggering GitHub Actions workflow for alert: $alert_type"

    local payload=$(cat <<EOF
{
  "event_type": "alert-triggered",
  "client_payload": {
    "alert_type": "$alert_type",
    "severity": "$severity",
    "description": "$description",
    "value": "$value",
    "timestamp": "$(date -Iseconds)"
  }
}
EOF
)

    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/dispatches" \
        -d "$payload")

    if [ "$response" = "204" ]; then
        echo "✅ GitHub Actions workflow triggered successfully"
        return 0
    else
        echo "❌ Failed to trigger GitHub Actions workflow (HTTP $response)"
        return 1
    fi
}

# Function to handle different alert types
handle_alert() {
    local alert_data="$1"

    # Parse alert data (assuming JSON input)
    local alert_type=$(echo "$alert_data" | jq -r '.labels.alertname // "Unknown"')
    local severity=$(echo "$alert_data" | jq -r '.labels.severity // "unknown"')
    local description=$(echo "$alert_data" | jq -r '.annotations.description // .annotations.summary // "No description"')
    local value=$(echo "$alert_data" | jq -r '.value // "N/A"')
    local status=$(echo "$alert_data" | jq -r '.status // "unknown"')

    echo "📨 Processing alert: $alert_type (severity: $severity, status: $status)"

    # Only trigger workflows for firing alerts
    if [ "$status" = "firing" ]; then
        case "$alert_type" in
            "HighErrorRate")
                echo "🔥 High error rate alert - triggering emergency response"
                trigger_github_workflow "$alert_type" "$severity" "$description" "$value"
                ;;
            "ServiceDown")
                echo "🚨 Service down alert - triggering critical response"
                trigger_github_workflow "$alert_type" "$severity" "$description" "$value"
                ;;
            "HighLatency")
                echo "⚠️ High latency alert - triggering scaling response"
                trigger_github_workflow "$alert_type" "$severity" "$description" "$value"
                ;;
            "DatabaseConnectionIssues")
                echo "🗄️ Database issues alert - triggering recovery response"
                trigger_github_workflow "$alert_type" "$severity" "$description" "$value"
                ;;
            *)
                echo "ℹ️ Alert type '$alert_type' received but no automated action configured"
                ;;
        esac
    elif [ "$status" = "resolved" ]; then
        echo "✅ Alert resolved: $alert_type"
        # Could trigger resolution workflows here if needed
    fi
}

# Main webhook handler
main() {
    # Check if alert data is provided via environment variable (from Node.js app)
    if [ -n "$ALERT_DATA" ]; then
        echo "📥 Processing alert from environment variable"
        handle_alert "$ALERT_DATA"
    else
        # Read webhook payload from stdin (direct Alertmanager webhook)
        local payload=""
        while IFS= read -r line; do
            payload="$payload$line"
        done

        echo "📥 Received webhook payload from stdin"

        # Check if it's a single alert or multiple alerts
        local alert_count=$(echo "$payload" | jq '.alerts // [.alert] | length' 2>/dev/null || echo "0")

        if [ "$alert_count" -gt 0 ]; then
            echo "Processing $alert_count alert(s)"

            # Process each alert
            for i in $(seq 0 $((alert_count - 1))); do
                local alert_data=$(echo "$payload" | jq ".alerts[$i] // .alert" 2>/dev/null)
                if [ -n "$alert_data" ] && [ "$alert_data" != "null" ]; then
                    handle_alert "$alert_data"
                fi
            done
        else
            echo "⚠️ No alerts found in payload or invalid JSON"
            echo "Payload: $payload"
        fi
    fi

    echo "✅ Webhook processing completed"
}

# Run main function
main "$@"