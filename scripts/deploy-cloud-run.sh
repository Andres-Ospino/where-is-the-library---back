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

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPOSITORY}/${SERVICE_NAME}:${IMAGE_TAG}"
JWT_SECRET=${JWT_SECRET:-""}
DATABASE_URL=${DATABASE_URL:-""}
INSTANCE_NAME=${INSTANCE_NAME:-""}

<<<<<<< HEAD
=======
if [[ -z "${DATABASE_URL}" ]]; then
  echo "❌ Debes definir DATABASE_URL en el entorno (por ejemplo en .env.gcloud.local)."
  exit 1
fi

>>>>>>> origin/codex/remove-prisma-ldugxq
if [[ "${JWT_SECRET}" == "define-un-secreto-robusto" || -z "${JWT_SECRET}" ]]; then
  echo "❌ Debes definir JWT_SECRET en el entorno (por ejemplo en .env.gcloud.local)."
  exit 1
fi

if [[ -z "${INSTANCE_NAME}" ]]; then
  echo "⚠️ INSTANCE_NAME está vacío; se omitirá la vinculación automática de Cloud SQL."
fi

INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"

echo "🚀 Iniciando despliegue de ${SERVICE_NAME}"
echo "🆔 Proyecto: ${PROJECT_ID}"
echo "📍 Región: ${REGION}"
echo "🖼️ Imagen: ${IMAGE_URI}"

gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "🏗️ Construyendo imagen con Cloud Build..."
gcloud builds submit \
  --config cloudbuild.yaml \
  --project "${PROJECT_ID}" \
<<<<<<< HEAD
  --substitutions=_SERVICE_NAME="${SERVICE_NAME}",_REGION="${REGION}",_ARTIFACT_REPOSITORY="${ARTIFACT_REPOSITORY}",_IMAGE_TAG="${IMAGE_TAG}",_JWT_SECRET="${JWT_SECRET}"

echo "🚢 Desplegando servicio en Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_URI}" \
  --region "${REGION}" \
  --allow-unauthenticated \
  --platform managed \
  --set-env-vars "NODE_ENV=production,PORT=8080,JWT_SECRET=${JWT_SECRET}" \
=======
  --substitutions=_SERVICE_NAME="${SERVICE_NAME}",_REGION="${REGION}",_ARTIFACT_REPOSITORY="${ARTIFACT_REPOSITORY}",_IMAGE_TAG="${IMAGE_TAG}",_JWT_SECRET="${JWT_SECRET}",_DATABASE_URL="${DATABASE_URL}"

echo "🚢 Desplegando servicio en Cloud Run..."
DEPLOY_ARGS=(
  run deploy "${SERVICE_NAME}"
  --image "${IMAGE_URI}"
  --region "${REGION}"
  --allow-unauthenticated
  --platform managed
  --set-env-vars "NODE_ENV=production,PORT=8080,JWT_SECRET=${JWT_SECRET},DATABASE_URL=${DATABASE_URL}"
>>>>>>> origin/codex/remove-prisma-ldugxq
  --project "${PROJECT_ID}"
)
if [[ -n "${INSTANCE_NAME}" ]]; then
  DEPLOY_ARGS+=(--add-cloudsql-instances "${INSTANCE_CONNECTION_NAME}")
fi
gcloud "${DEPLOY_ARGS[@]}"

echo "✅ Despliegue finalizado"
