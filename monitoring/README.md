# Phase 7: Operate - Monitoring & Logging Setup

This directory contains the complete monitoring and logging infrastructure for Balance Sheet Pro.

## 🏗️ Architecture

### Monitoring Stack (Prometheus/Grafana)
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Metrics visualization and dashboards
- **Node Exporter**: System-level metrics (CPU, memory, disk)
- **cAdvisor**: Container-level metrics

### Logging Stack (ELK)
- **Elasticsearch**: Log storage and search
- **Logstash**: Log processing and transformation
- **Kibana**: Log visualization and analysis
- **Filebeat**: Log shipping from containers

## 🚀 Quick Start

### Start All Services
```bash
docker compose up -d
```

### Access Points
- **Application**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200

## 📊 Dashboards

### Grafana Dashboard
- Pre-configured dashboard at: http://localhost:3001/d/balance-sheet-dashboard
- Includes metrics for:
  - HTTP request rates and latency
  - Error rates
  - System and container resource usage
  - Active alerts

### Kibana Dashboards
- Access at: http://localhost:5601
- Create index pattern: `balance-sheet-*`
- Visualize logs by container, level, and time

## 🚨 Alerting Rules

Based on your performance benchmarks (P95 < 500ms, Error Rate < 10%):

### Critical Alerts (Trigger Automated Response)
- **Service Down**: Application unavailable for > 1 minute
  - *Action*: Automatic pod restart and incident creation
- **High Error Rate**: Error rate > 10% for 5 minutes
  - *Action*: Emergency rollback to previous version

### Warning Alerts (Monitoring & Notification)
- **High Latency**: P95 response time > 500ms for 5 minutes
  - *Action*: Automatic scaling up to 5 replicas
- **High Memory Usage**: Memory usage > 90% for 5 minutes
- **High CPU Usage**: CPU usage > 80% for 5 minutes
- **Database Issues**: Connection errors > 5 in 5 minutes
  - *Action*: Application pod restart to refresh connections

## 🔄 Feedback Loop - Automated Alert Response

The system implements a complete **monitoring-to-deployment feedback loop**:

### Architecture
```
Alert Trigger → Alertmanager → Webhook → GitHub Actions → Automated Response
```

### Automated Responses

1. **High Error Rate (Critical)**
   - Triggers emergency rollback to previous deployment
   - Creates GitHub issue for incident tracking
   - Notifies team via Slack

2. **Service Down (Critical)**
   - Attempts automatic pod restart
   - Creates incident issue with investigation checklist
   - Escalates via PagerDuty (if configured)

3. **High Latency (Warning)**
   - Automatically scales application to 5 replicas
   - Creates performance investigation issue

4. **Database Issues (Warning)**
   - Restarts application pods to refresh connections
   - Logs diagnostic information

### Configuration

#### Environment Variables
```bash
# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPOSITORY=danieltn889/BalanceSheetPro

# Alertmanager
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
WEBHOOK_USERNAME=webhook
WEBHOOK_PASSWORD=secure_password
```

#### Webhook Endpoint
- **URL**: `POST /webhook/alert`
- **Purpose**: Receives alerts from Alertmanager and triggers GitHub Actions
- **Authentication**: Basic auth using webhook credentials

## 🧪 Testing the Feedback Loop

Use the provided test script to verify the alert response system:

```bash
# Test all alert scenarios
./scripts/test-alert-feedback.sh

# Or test individual alerts
curl -X POST http://localhost:3000/webhook/alert \
  -H "Content-Type: application/json" \
  -u webhook:password \
  -d '{
    "alerts": [{
      "labels": {"alertname": "HighErrorRate", "severity": "critical"},
      "annotations": {"description": "Error rate is 15%"},
      "status": "firing"
    }]
  }'
```

### Expected Behavior
1. **Alert Received**: Application logs show alert processing
2. **GitHub Actions Triggered**: New workflow run appears in Actions tab
3. **Automated Response**: Appropriate action taken (rollback, scaling, restart)
4. **Notifications**: Slack messages sent (if configured)
5. **Incident Tracking**: GitHub issues created for critical alerts

## 🔧 Configuration Files

### Prometheus
- `prometheus.yml`: Main configuration with scrape targets
- `alert_rules.yml`: Alerting rules based on SLOs

### Grafana
- `provisioning/datasources/prometheus.yml`: Prometheus datasource
- `provisioning/dashboards/dashboard.yml`: Dashboard provider config
- `dashboards/balance-sheet-dashboard.json`: Main application dashboard

### ELK Stack
- `logstash/pipeline/logstash.conf`: Log processing pipeline
- `logstash/config/logstash.yml`: Logstash configuration
- `filebeat/filebeat.yml`: Filebeat log shipping configuration

## 📈 Metrics Collected

### Application Metrics
- HTTP request count, duration, and error rates
- Custom business metrics (when added)

### System Metrics
- CPU usage and load
- Memory usage
- Disk I/O and space
- Network traffic

### Container Metrics
- CPU and memory usage per container
- Network I/O
- Block I/O

## 🔍 Log Collection

### Application Logs
- Structured JSON logs from Express/Morgan
- Error logs with stack traces
- Request/response logs

### System Logs
- Docker container logs
- System service logs
- Kubernetes logs (when deployed)

## 🎯 Error Budgets

Based on your performance targets:
- **Availability**: 99.9% uptime (8.77 hours downtime/year)
- **Latency**: P95 < 500ms for all requests
- **Error Rate**: < 10% of total requests

## 🛠️ Maintenance

### Data Retention
- **Prometheus**: 200 hours of metrics data
- **Elasticsearch**: Daily indices with configurable retention

### Backups
- Grafana dashboards are persisted in Docker volumes
- Elasticsearch data is persisted
- Prometheus data is persisted

### Scaling
- Add more Prometheus instances for high availability
- Use Elasticsearch clusters for production
- Configure log retention policies based on storage capacity

## 🚀 Production Deployment

For production, consider:
1. **External Databases**: Move Elasticsearch to managed service
2. **Load Balancing**: Add Nginx/HAProxy for Grafana/Kibana
3. **Security**: Configure authentication and TLS
4. **Backup Strategy**: Regular backups of metrics and logs
5. **Alertmanager**: Configure email/Slack notifications

## 📋 Troubleshooting

### Common Issues
1. **Grafana not loading**: Check Prometheus connectivity
2. **No metrics in Prometheus**: Verify target endpoints are accessible
3. **Logs not appearing in Kibana**: Check Filebeat to Logstash connection
4. **High resource usage**: Adjust scrape intervals or add more resources

### Useful Commands
```bash
# Check service status
docker compose ps

# View logs
docker compose logs prometheus
docker compose logs grafana
docker compose logs logstash

# Restart services
docker compose restart prometheus
```