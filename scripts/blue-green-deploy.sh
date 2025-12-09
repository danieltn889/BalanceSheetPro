#!/bin/bash

# Blue-Green Deployment Script for BalanceSheet Pro
# This script implements zero-downtime blue-green deployments

set -e

# Configuration
DEPLOYMENT_NAME="balance-sheet-pro"
SERVICE_NAME="balance-sheet-pro"
NEW_IMAGE="$1"
NAMESPACE="${2:-default}"

if [ -z "$NEW_IMAGE" ]; then
    echo "❌ Usage: $0 <new-image> [namespace]"
    echo "Example: $0 danieltn889/balance-sheet-pro:v1.0.0"
    exit 1
fi

echo "🚀 Starting Blue-Green Deployment"
echo "New Image: $NEW_IMAGE"
echo "Namespace: $NAMESPACE"

# Check if kubectl is available
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "❌ Kubernetes cluster not accessible"
    exit 1
fi

# Get current deployment info
CURRENT_IMAGE=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "none")

if [ "$CURRENT_IMAGE" = "none" ]; then
    echo "📦 No existing deployment found. Performing initial deployment..."
    # Initial deployment
    export DOCKER_IMAGE="$NEW_IMAGE"
    envsubst < k8s/deployment.yaml | kubectl apply -f -
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=300s
    echo "✅ Initial deployment completed"
    exit 0
fi

echo "📊 Current Image: $CURRENT_IMAGE"
echo "🎯 New Image: $NEW_IMAGE"

# Create green deployment (new version)
GREEN_DEPLOYMENT="${DEPLOYMENT_NAME}-green"
echo "🟢 Creating Green deployment..."

# Create green deployment with new image
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $GREEN_DEPLOYMENT
  namespace: $NAMESPACE
  labels:
    app: balance-sheet-pro
    color: green
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: balance-sheet-pro
      color: green
  template:
    metadata:
      labels:
        app: balance-sheet-pro
        color: green
    spec:
      containers:
        - name: api
          image: $NEW_IMAGE
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              name: http
          volumeMounts:
            - name: database-storage
              mountPath: /app/data
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3000"
            - name: DATABASE_PATH
              value: "/app/data/balancesheet.db"
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 30
EOF

# Wait for green deployment to be ready
echo "⏳ Waiting for Green deployment to be ready..."
kubectl rollout status deployment/$GREEN_DEPLOYMENT -n $NAMESPACE --timeout=300s

# Test green deployment
echo "🧪 Testing Green deployment..."
GREEN_POD=$(kubectl get pods -n $NAMESPACE -l color=green -o jsonpath='{.items[0].metadata.name}')
kubectl exec $GREEN_POD -n $NAMESPACE -- curl -f http://localhost:3000/health || {
    echo "❌ Green deployment health check failed"
    kubectl delete deployment $GREEN_DEPLOYMENT -n $NAMESPACE
    exit 1
}

echo "✅ Green deployment is healthy"

# Switch service to green deployment
echo "🔄 Switching service to Green deployment..."
kubectl patch service $SERVICE_NAME -n $NAMESPACE -p '{
  "spec": {
    "selector": {
      "app": "balance-sheet-pro",
      "color": "green"
    }
  }
}'

# Wait for service to update
sleep 10

# Verify service is working
echo "🔍 Verifying service functionality..."
kubectl run test-health --image=curlimages/curl --rm -i --restart=Never -- curl -f http://$SERVICE_NAME/health || {
    echo "❌ Service verification failed"
    # Rollback to blue
    kubectl patch service $SERVICE_NAME -n $NAMESPACE -p '{
      "spec": {
        "selector": {
          "app": "balance-sheet-pro",
          "color": "blue"
        }
      }
    }'
    kubectl delete deployment $GREEN_DEPLOYMENT -n $NAMESPACE
    exit 1
}

echo "✅ Service successfully switched to Green deployment"

# Clean up old blue deployment
echo "🧹 Cleaning up old Blue deployment..."
kubectl delete deployment $DEPLOYMENT_NAME -n $NAMESPACE 2>/dev/null || true

# Rename green to blue for next deployment
kubectl label deployment $GREEN_DEPLOYMENT color=blue --overwrite -n $NAMESPACE
kubectl label deployment $GREEN_DEPLOYMENT color- --overwrite -n $NAMESPACE

echo "🎉 Blue-Green deployment completed successfully!"
echo "📊 New active deployment: $DEPLOYMENT_NAME"
echo "🖼️  Active image: $NEW_IMAGE"