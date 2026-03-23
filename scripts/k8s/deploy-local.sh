#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Project root is two levels up from scripts/k8s/
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." &> /dev/null && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Deploying Image Flow to local Kubernetes cluster from project root: $PROJECT_ROOT"

# 0. Check KEDA
if ! kubectl get namespace keda &> /dev/null; then
  echo "⚠️ KEDA namespace not found. KEDA is required for autoscaling."
  echo "💡 Please install KEDA first: kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.16.1/keda-2.16.1.yaml"
  echo "   (Wait for KEDA pods to be ready before testing autoscaling)"
fi

# 1. Build images
echo '📦 Building Docker images...'
docker build -t image-service:latest -f services/apps/image-service/Dockerfile .
docker build -t processor-service:latest -f services/apps/processor-service/Dockerfile .

# 2. Infrastructure
echo '🏷 Applying Kubernetes manifests...'
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/rabbitmq.yaml
kubectl apply -f k8s/minio.yaml
kubectl apply -f k8s/image-service.yaml
kubectl apply -f k8s/processor-service.yaml

# 3. KEDA Scaling
kubectl apply -f k8s/keda-scaledobject.yaml

# 4. Cleanup & Force Restart
echo '♻️ Cleaning up old jobs and restarting services...'
kubectl delete job minio-init-job -n image-flow --ignore-not-found
kubectl rollout restart deployment image-service -n image-flow
kubectl rollout restart deployment processor-service -n image-flow

# 5. Run MinIO Init
kubectl apply -f k8s/minio-init-job.yaml

echo '✅ Deployment complete!'
echo '🌐 Image service exposed at: http://localhost:3000'
echo '📊 Monitor scaling with: kubectl get pods -n image-flow -w'
