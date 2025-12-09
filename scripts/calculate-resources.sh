#!/bin/bash

# Kubernetes Resource Calculator for BalanceSheet Pro
# Calculates optimal resource requirements based on application metrics

set -e

echo "🧮 Kubernetes Resource Calculator for BalanceSheet Pro"
echo "===================================================="

# Application metrics (from performance tests)
P95_RESPONSE_TIME=156  # ms
ERROR_RATE=0           # percentage
THROUGHPUT=67          # requests per second
CONCURRENT_USERS=100   # max concurrent users

echo "📊 Application Metrics:"
echo "- P95 Response Time: ${P95_RESPONSE_TIME}ms"
echo "- Error Rate: ${ERROR_RATE}%"
echo "- Throughput: ${THROUGHPUT} req/sec"
echo "- Max Concurrent Users: ${CONCURRENT_USERS}"
echo ""

# Calculate CPU requirements
# Formula: CPU cores = (requests_per_second × avg_response_time_seconds) × safety_factor
AVG_RESPONSE_TIME_SEC=$(echo "scale=3; $P95_RESPONSE_TIME / 1000" | bc)
CPU_CORES_RAW=$(echo "scale=3; $THROUGHPUT * $AVG_RESPONSE_TIME_SEC" | bc)
CPU_CORES=$(echo "scale=3; $CPU_CORES_RAW * 1.5" | bc)  # 50% safety margin

# Convert to millicores
CPU_MILLICORES=$(echo "scale=0; $CPU_CORES * 1000" | bc)

echo "🖥️  CPU Calculations:"
echo "- Raw CPU requirement: ${CPU_CORES_RAW} cores"
echo "- With safety margin: ${CPU_CORES} cores"
echo "- Millicores: ${CPU_MILLICORES}m"
echo ""

# Calculate memory requirements
# Base memory + connection overhead + caching
BASE_MEMORY=64    # MB for Node.js runtime
CONNECTION_MEMORY=$(echo "scale=0; $CONCURRENT_USERS * 2" | bc)  # 2MB per connection
CACHE_MEMORY=32   # MB for application cache
TOTAL_MEMORY_MB=$(echo "scale=0; $BASE_MEMORY + $CONNECTION_MEMORY + $CACHE_MEMORY" | bc)
TOTAL_MEMORY_MB_SAFETY=$(echo "scale=0; $TOTAL_MEMORY_MB * 1.5" | bc)  # 50% safety

echo "💾 Memory Calculations:"
echo "- Base runtime: ${BASE_MEMORY}MB"
echo "- Connection overhead: ${CONNECTION_MEMORY}MB"
echo "- Cache/buffer: ${CACHE_MEMORY}MB"
echo "- Total required: ${TOTAL_MEMORY_MB}MB"
echo "- With safety margin: ${TOTAL_MEMORY_MB_SAFETY}MB"
echo ""

# Pod resource recommendations
echo "📋 Pod Resource Recommendations:"
echo "================================"

# CPU recommendations
CPU_MILLICORES_INT=$(echo "scale=0; $CPU_MILLICORES / 1" | bc)
if [ "$CPU_MILLICORES_INT" -lt 100 ]; then
    CPU_REQUEST="50m"
    CPU_LIMIT="200m"
elif [ "$CPU_MILLICORES_INT" -lt 500 ]; then
    CPU_REQUEST="100m"
    CPU_LIMIT="500m"
else
    CPU_REQUEST="200m"
    CPU_LIMIT="1000m"
fi

echo "CPU per Pod:"
echo "- Request: $CPU_REQUEST"
echo "- Limit: $CPU_LIMIT"
echo ""

# Memory recommendations
TOTAL_MEMORY_MB_SAFETY_INT=$(echo "scale=0; $TOTAL_MEMORY_MB_SAFETY / 1" | bc)
if [ "$TOTAL_MEMORY_MB_SAFETY_INT" -lt 128 ]; then
    MEM_REQUEST="64Mi"
    MEM_LIMIT="128Mi"
elif [ "$TOTAL_MEMORY_MB_SAFETY_INT" -lt 512 ]; then
    MEM_REQUEST="128Mi"
    MEM_LIMIT="512Mi"
else
    MEM_REQUEST="256Mi"
    MEM_LIMIT="1024Mi"
fi

echo "Memory per Pod:"
echo "- Request: $MEM_REQUEST"
echo "- Limit: $MEM_LIMIT"
echo ""

# Replica calculations
echo "🔄 Replica Calculations:"
echo "======================="

# Calculate replicas for high availability
MIN_REPLICAS=2
MAX_REPLICAS=10

# CPU-based scaling
TOTAL_CPU_AVAILABLE=2000  # Assume 2-core node
REPLICAS_BY_CPU=$(echo "scale=0; $TOTAL_CPU_AVAILABLE / ($CPU_MILLICORES / 1000)" | bc)
REPLICAS_BY_CPU=$((REPLICAS_BY_CPU > MAX_REPLICAS ? MAX_REPLICAS : REPLICAS_BY_CPU))
REPLICAS_BY_CPU=$((REPLICAS_BY_CPU < MIN_REPLICAS ? MIN_REPLICAS : REPLICAS_BY_CPU))

echo "High Availability Setup:"
echo "- Minimum replicas: $MIN_REPLICAS (for HA)"
echo "- Maximum replicas: $MAX_REPLICAS (scaling limit)"
echo "- Recommended by CPU: $REPLICAS_BY_CPU"
echo ""

# Storage calculations
echo "💿 Storage Requirements:"
echo "======================="
echo "- Application data: 1GB (SQLite database)"
echo "- Logs: 2GB (rotated logs)"
echo "- Temporary files: 500MB"
echo "- Total PVC size: 4GB"
echo ""

# Network calculations
echo "🌐 Network Requirements:"
echo "======================="
echo "- Ingress bandwidth: ${THROUGHPUT} req/sec"
echo "- Egress bandwidth: $(echo "scale=1; $THROUGHPUT * 10" | bc) KB/sec (avg response)"
echo "- Concurrent connections: $CONCURRENT_USERS"
echo ""

# HPA configuration
echo "📈 Horizontal Pod Autoscaler (HPA) Configuration:"
echo "================================================"
echo "apiVersion: autoscaling/v2"
echo "kind: HorizontalPodAutoscaler"
echo "metadata:"
echo "  name: balance-sheet-pro-hpa"
echo "spec:"
echo "  scaleTargetRef:"
echo "    apiVersion: apps/v1"
echo "    kind: Deployment"
echo "    name: balance-sheet-pro"
echo "  minReplicas: $MIN_REPLICAS"
echo "  maxReplicas: $MAX_REPLICAS"
echo "  metrics:"
echo "  - type: Resource"
echo "    resource:"
echo "      name: cpu"
echo "      target:"
echo "        type: Utilization"
echo "        averageUtilization: 60"
echo "  - type: Resource"
echo "    resource:"
echo "      name: memory"
echo "      target:"
echo "        type: Utilization"
echo "        averageUtilization: 70"
echo ""

# Cost estimation
echo "💰 Cost Estimation (Monthly):"
echo "============================="
echo "- EC2 t3.medium (2 vCPU, 4GB RAM): $30-40"
echo "- EBS Storage (20GB): $2-3"
echo "- Load Balancer: $15-20"
echo "- Data Transfer: $5-10"
echo "- **Total Estimated Cost: $52-73**"
echo ""

# Generate deployment YAML snippet
echo "📄 Recommended Deployment Configuration:"
echo "========================================"

# Create resource requirements file
cat > k8s/resource-requirements.yaml << EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: balance-sheet-pro-resources
  namespace: production
data:
  cpu-request: "$CPU_REQUEST"
  cpu-limit: "$CPU_LIMIT"
  memory-request: "$MEM_REQUEST"
  memory-limit: "$MEM_LIMIT"
  min-replicas: "$MIN_REPLICAS"
  max-replicas: "$MAX_REPLICAS"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: balance-sheet-pro-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: balance-sheet-pro
  minReplicas: $MIN_REPLICAS
  maxReplicas: $MAX_REPLICAS
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
EOF

cat << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: balance-sheet-pro
spec:
  replicas: $MIN_REPLICAS
  template:
    spec:
      containers:
      - name: api
        resources:
          requests:
            cpu: $CPU_REQUEST
            memory: $MEM_REQUEST
          limits:
            cpu: $CPU_LIMIT
            memory: $MEM_LIMIT
EOF

echo ""
echo "✅ Resource calculation completed!"
echo "📊 Use these values in your k8s/deployment.yaml"