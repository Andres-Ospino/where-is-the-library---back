#!/bin/bash

# Deploy to Google Cloud Run script
set -e

# Configuration
PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME="library-management-system"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying Library Management System to Google Cloud Run"
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

echo "📤 Pushing image to Container Registry..."
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --project $PROJECT_ID

echo "✅ Deployment completed!"
echo "🌐 Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID
