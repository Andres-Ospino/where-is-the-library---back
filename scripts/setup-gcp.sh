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
ARTIFACT_REPO_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPOSITORY}/${SERVICE_NAME}"

export CLOUDSDK_CORE_PROJECT="${PROJECT_ID}"

echo "🔧 Configurando Google Cloud Platform"
echo "🆔 Proyecto: ${PROJECT_ID}"
echo "📍 Región: ${REGION}"

gcloud config set project "${PROJECT_ID}" >/dev/null

echo "📡 Habilitando APIs requeridas..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
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

JWT_SECRET=${JWT_SECRET:-""}
if [[ "${JWT_SECRET}" == "define-un-secreto-robusto" || -z "${JWT_SECRET}" ]]; then
  echo "⚠️ Recuerda definir JWT_SECRET en .env.gcloud.local antes del despliegue."
<<<<<<< HEAD
=======
fi

if [[ -z "${DATABASE_URL:-}" || "${DATABASE_URL}" == *"REEMPLAZA_CONTRASENA"* ]]; then
  echo "⚠️ Define DATABASE_URL con las credenciales reales de tu instancia de Cloud SQL antes de desplegar."
>>>>>>> origin/codex/remove-prisma-ldugxq
fi

echo "✅ Recursos configurados correctamente"
echo "📦 Repositorio de imagen: ${ARTIFACT_REPO_PATH}"
echo "🔑 JWT_SECRET actual: ${JWT_SECRET:-"<no definido>"}"
