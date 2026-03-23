#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." &> /dev/null && pwd)"

NAMESPACE="image-flow"

echo "📈 Starting Scalability Test from: $PROJECT_ROOT"

# 1. Start monitoring in background
(while true; do
  # Get total queue depth (ready + unacked)
  STATS=$(kubectl exec deployment/rabbitmq-deployment -n $NAMESPACE -- rabbitmqctl list_queues name messages_ready messages_unacknowledged 2>/dev/null | grep image_process_queue)
  READY=$(echo $STATS | awk '{print $2}')
  UNACKED=$(echo $STATS | awk '{print $3}')
  TOTAL=$((READY + UNACKED))
  
  POD_COUNT=$(kubectl get pods -n $NAMESPACE -l app=processor-service --no-headers 2>/dev/null | grep Running | wc -l)
  
  echo "[$(date +%T)] Total Messages: ${TOTAL:-0} (Ready: ${READY:-0}, Unacked: ${UNACKED:-0}) | Active Workers: ${POD_COUNT}"
  sleep 5
done) &
MONITOR_PID=$!

# 2. Trigger Upload
bash "$SCRIPT_DIR/upload_images.sh"

echo "✅ Images upload triggered. Monitoring scaling for 2 minutes..."
sleep 120

kill $MONITOR_PID
echo "🏁 Test complete. Check the logs above for scaling behavior."
