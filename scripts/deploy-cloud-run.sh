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
IMAGE_TAG=${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}
DB_INSTANCE_NAME=${INSTANCE_NAME:-"library-db-instance"}
INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}"

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPOSITORY}/${SERVICE_NAME}:${IMAGE_TAG}"

DATABASE_URL=${DATABASE_URL:-""}
JWT_SECRET=${JWT_SECRET:-""}

if [[ -z "${DATABASE_URL}" || "${JWT_SECRET}" == "define-un-secreto-robusto" || -z "${JWT_SECRET}" ]]; then
  echo "❌ Debes definir DATABASE_URL y JWT_SECRET en el entorno (por ejemplo en .env.gcloud.local)."
  exit 1
fi

if [[ "${DATABASE_URL}" == *"REEMPLAZA_CONTRASENA"* ]]; then
  echo "❌ Actualiza la DATABASE_URL con la contraseña real generada para Cloud SQL."
  exit 1
fi

echo "🚀 Iniciando despliegue de ${SERVICE_NAME}"
echo "🆔 Proyecto: ${PROJECT_ID}"
echo "📍 Región: ${REGION}"
echo "🖼️ Imagen: ${IMAGE_URI}"

gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "🏗️ Construyendo imagen con Cloud Build..."
gcloud builds submit \
  --config cloudbuild.yaml \
  --project "${PROJECT_ID}" \
  --substitutions=_SERVICE_NAME="${SERVICE_NAME}",_REGION="${REGION}",_ARTIFACT_REPOSITORY="${ARTIFACT_REPOSITORY}",_IMAGE_TAG="${IMAGE_TAG}",_INSTANCE_NAME="${DB_INSTANCE_NAME}",_DATABASE_URL="${DATABASE_URL}",_JWT_SECRET="${JWT_SECRET}"

echo "🧭 Actualizando job de migraciones (${SERVICE_NAME}-db-setup)..."
JOB_NAME="${SERVICE_NAME}-db-setup"
if gcloud run jobs describe "${JOB_NAME}" --region "${REGION}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud run jobs update "${JOB_NAME}" \
    --image "${IMAGE_URI}" \
    --region "${REGION}" \
    --add-cloudsql-instances "${INSTANCE_CONNECTION_NAME}" \
    --set-env-vars "DATABASE_URL=${DATABASE_URL},JWT_SECRET=${JWT_SECRET},NODE_ENV=production" \
    --command sh \
    --args=-c \
    --args='pnpm prisma migrate deploy && pnpm prisma seed' \
    --project "${PROJECT_ID}"
else
  gcloud run jobs create "${JOB_NAME}" \
    --image "${IMAGE_URI}" \
    --region "${REGION}" \
    --add-cloudsql-instances "${INSTANCE_CONNECTION_NAME}" \
    --set-env-vars "DATABASE_URL=${DATABASE_URL},JWT_SECRET=${JWT_SECRET},NODE_ENV=production" \
    --command sh \
    --args=-c \
    --args='pnpm prisma migrate deploy && pnpm prisma seed' \
    --project "${PROJECT_ID}"
fi

echo "▶️ Ejecutando job ${JOB_NAME}..."
gcloud run jobs execute "${JOB_NAME}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}"

echo "✅ Despliegue finalizado"
