#!/bin/bash

# Exit on any error
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Project root is two levels up from scripts/k8s/
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." &> /dev/null && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Deploying Image Flow to local Kubernetes cluster"

# Pre-flight check: Verify cluster connectivity
echo "🔍 Checking Kubernetes cluster connectivity..."
if ! kubectl cluster-info &> /dev/null; then
  echo "❌ Error: Cannot connect to Kubernetes cluster."
  echo "👉 Please ensure your local cluster (Docker Desktop, minikube, etc.) is running."
  echo "   If using Docker Desktop, check if 'Kubernetes' is enabled in Settings."
  exit 1
fi

# 0. Check KEDA
if ! kubectl get namespace keda &> /dev/null; then
  echo "⚠️ KEDA namespace not found. KEDA is required for autoscaling."
  echo "💡 Please install KEDA first: kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.16.1/keda-2.16.1.yaml"
fi

# 1. Build images
echo '📦 Building Docker images...'
docker build -t image-service:latest -f services/apps/image-service/Dockerfile .
docker build -t processor-service:latest -f services/apps/processor-service/Dockerfile .

# 2. Infrastructure & Application deployment via Helm
echo '🏷 Applying Helm chart...'

# Ensure namespace exists
kubectl create namespace image-flow --dry-run=client -o yaml | kubectl apply -f -

# 3. Cleanup old minio job before helm install
echo '♻️ Cleaning up old minio-init job...'
kubectl delete job minio-init-job -n image-flow --ignore-not-found

echo '⛵ Deploying via Helm...'
helm upgrade --install image-flow ./k8s/helm/image-flow -n image-flow

# 4. Restart Services (Optional but ensures latest build is pulled if image tag is latest)
echo '♻️ Restarting services to ensure latest images are used...'
kubectl rollout restart deployment image-service -n image-flow
kubectl rollout restart deployment processor-service -n image-flow

echo '✅ Deployment complete!'
echo '🌐 Image service exposed at: http://localhost:3000'
echo '📊 Monitor scaling with: kubectl get pods -n image-flow -w'
