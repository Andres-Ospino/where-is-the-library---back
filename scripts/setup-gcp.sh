#!/bin/bash

# Google Cloud Platform setup script
set -e

PROJECT_ID=${1:-"your-project-id"}
REGION="us-central1"
DB_INSTANCE_NAME="library-db-instance"
DB_NAME="library_db"
DB_USER="library_user"
SQL_EDITION="ENTERPRISE"
SQL_TIER="db-f1-micro"

if [[ "$SQL_TIER" == "db-f1-micro" && "$SQL_EDITION" != "ENTERPRISE" ]]; then
  echo "❌ The tier $SQL_TIER is only available for the ENTERPRISE edition."
  echo "Please select a compatible edition or adjust the tier accordingly."
  exit 1
fi

echo "🔧 Setting up Google Cloud Platform resources"
echo "Project ID: $PROJECT_ID"

echo "Using Cloud SQL edition: $SQL_EDITION"
echo "Using tier: $SQL_TIER"

# Enable required APIs
echo "📡 Enabling required APIs..."
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  --project $PROJECT_ID

# Create Cloud SQL instance
echo "🗄️ Creating Cloud SQL PostgreSQL instance..."
gcloud sql instances create $DB_INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --edition=$SQL_EDITION \
  --tier=$SQL_TIER \
  --region=$REGION \
  --project $PROJECT_ID

# Create database
echo "📊 Creating database..."
gcloud sql databases create $DB_NAME \
  --instance=$DB_INSTANCE_NAME \
  --project $PROJECT_ID

# Create database user
echo "👤 Creating database user..."
DB_PASSWORD=$(openssl rand -base64 32)
gcloud sql users create $DB_USER \
  --instance=$DB_INSTANCE_NAME \
  --password=$DB_PASSWORD \
  --project $PROJECT_ID

echo "✅ GCP setup completed!"
echo "📝 Save these credentials:"
echo "Database Instance: $DB_INSTANCE_NAME"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "Database Password: $DB_PASSWORD"
echo ""
echo "🔗 Connection string for Cloud Run:"
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@//$DB_NAME?host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"
