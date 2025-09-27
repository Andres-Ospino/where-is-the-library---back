#!/bin/bash

set -euo pipefail

ENV_FILE=".env.gcloud.local"
if [[ -f "${ENV_FILE}" ]]; then
  set -o allexport
  # shellcheck disable=SC1091
  source "${ENV_FILE}"
  set +o allexport
elif [[ -f ".env.gcloud" ]]; then
  set -o allexport
  # shellcheck disable=SC1091
  source .env.gcloud
  set +o allexport
fi

PROJECT_ID=${PROJECT_ID:-${1:-}}
if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "your-gcp-project-id" ]]; then
  echo "❌ Debes proporcionar el PROJECT_ID como argumento o variable de entorno válido."
  exit 1
fi

REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"library-management-system"}
ARTIFACT_REPOSITORY=${ARTIFACT_REPOSITORY:-"library-management-system"}
DB_INSTANCE_NAME=${INSTANCE_NAME:-"library-db-instance"}
DB_NAME=${DB_NAME:-"library_db"}
DB_USER=${DB_USER:-"library_user"}
SQL_EDITION=${SQL_EDITION:-"ENTERPRISE"}
SQL_TIER=${SQL_TIER:-"db-custom-1-3840"}
STORAGE_SIZE=${STORAGE_SIZE:-"10"}

if [[ "${SQL_EDITION}" != "ENTERPRISE" ]]; then
  echo "❌ Esta guía utiliza Cloud SQL ENTERPRISE edition para garantizar compatibilidad con el tier ${SQL_TIER}."
  exit 1
fi

ARTIFACT_REPO_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPOSITORY}/${SERVICE_NAME}"
INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}"

export CLOUDSDK_CORE_PROJECT="${PROJECT_ID}"

echo "🔧 Configurando Google Cloud Platform"
echo "🆔 Proyecto: ${PROJECT_ID}"
echo "📍 Región: ${REGION}"

gcloud config set project "${PROJECT_ID}" >/dev/null

echo "📡 Habilitando APIs requeridas..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com sqladmin.googleapis.com \
  --project "${PROJECT_ID}"

echo "🏷️ Configurando Artifact Registry (${ARTIFACT_REPO_PATH})"
if gcloud artifacts repositories describe "${ARTIFACT_REPOSITORY}" \
  --location="${REGION}" \
  --project "${PROJECT_ID}" >/dev/null 2>&1; then
  echo "ℹ️ El repositorio ya existe."
else
  gcloud artifacts repositories create "${ARTIFACT_REPOSITORY}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Docker images for ${SERVICE_NAME}" \
    --project "${PROJECT_ID}"
fi

echo "🗄️ Creando instancia de Cloud SQL (${DB_INSTANCE_NAME})..."
if gcloud sql instances describe "${DB_INSTANCE_NAME}" \
  --project "${PROJECT_ID}" >/dev/null 2>&1; then
  echo "ℹ️ La instancia ya existe, se reutilizará."
else
  gcloud sql instances create "${DB_INSTANCE_NAME}" \
    --database-version=POSTGRES_15 \
    --edition="${SQL_EDITION}" \
    --tier="${SQL_TIER}" \
    --storage-size="${STORAGE_SIZE}" \
    --region="${REGION}" \
    --project "${PROJECT_ID}"
fi

echo "📊 Verificando base de datos (${DB_NAME})..."
if gcloud sql databases describe "${DB_NAME}" \
  --instance="${DB_INSTANCE_NAME}" \
  --project "${PROJECT_ID}" >/dev/null 2>&1; then
  echo "ℹ️ La base de datos ya existe."
else
  gcloud sql databases create "${DB_NAME}" \
    --instance="${DB_INSTANCE_NAME}" \
    --project "${PROJECT_ID}"
fi

echo "👤 Configurando usuario (${DB_USER})..."
DB_PASSWORD=${DB_PASSWORD:-""}
if [[ -z "${DB_PASSWORD}" ]]; then
  DB_PASSWORD=$(openssl rand -base64 32)
fi
if gcloud sql users list \
  --instance="${DB_INSTANCE_NAME}" \
  --project "${PROJECT_ID}" | grep -q "${DB_USER}"; then
  gcloud sql users set-password "${DB_USER}" \
    --instance="${DB_INSTANCE_NAME}" \
    --password="${DB_PASSWORD}" \
    --project "${PROJECT_ID}"
else
  gcloud sql users create "${DB_USER}" \
    --instance="${DB_INSTANCE_NAME}" \
    --password="${DB_PASSWORD}" \
    --project "${PROJECT_ID}"
fi

echo "✅ Recursos configurados correctamente"

echo "🔗 Conexión Cloud SQL: ${INSTANCE_CONNECTION_NAME}"
echo "📦 Repositorio de imagen: ${ARTIFACT_REPO_PATH}"
echo "📝 Credenciales de base de datos:"
echo "  - Usuario: ${DB_USER}"
echo "  - Base de datos: ${DB_NAME}"
echo "  - Contraseña generada: ${DB_PASSWORD}"
echo
echo "📌 Actualiza tu archivo .env.gcloud.local con los valores anteriores y un JWT_SECRET seguro."
cat <<EOF
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}
JWT_SECRET=<<define-un-valor-seguro>>
EOF
