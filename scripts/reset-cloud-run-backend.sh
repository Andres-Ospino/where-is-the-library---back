#!/bin/bash

set -euo pipefail

PROJECT_ID=${PROJECT_ID:-"where-is-the-library"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"backend"}
PIPELINE_SCRIPT=${PIPELINE_SCRIPT:-"scripts/deploy-cloud-run.sh"}
HEALTH_URL=${HEALTH_URL:-""}
ARTIFACT_REPOSITORY=${ARTIFACT_REPOSITORY:-"library-management-system"}
IMAGE_TAG=${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}
INSTANCE_NAME=${INSTANCE_NAME:-"library-db-instance"}
DATABASE_URL=${DATABASE_URL:-""}
JWT_SECRET=${JWT_SECRET:-""}

usage() {
  cat <<USAGE
Uso: $0 [--project <project-id>] [--region <region>] [--service <service-name>] [--pipeline-script <ruta_script>] [--health-url <url_sonda>]

Variables de entorno disponibles:
  PROJECT_ID        ID del proyecto de GCP (por defecto: where-is-the-library)
  REGION            Región de Cloud Run (por defecto: us-central1)
  SERVICE_NAME      Nombre del servicio de Cloud Run (por defecto: backend)
  PIPELINE_SCRIPT   Script de despliegue a ejecutar tras limpiar comando (por defecto: scripts/deploy-cloud-run.sh)
  HEALTH_URL        URL opcional de la sonda de salud para validación manual
  ARTIFACT_REPOSITORY  Repositorio de Artifact Registry (por defecto: library-management-system)
  IMAGE_TAG            Tag de la imagen a desplegar (por defecto: hash corto de git o timestamp)
  INSTANCE_NAME        Nombre de la instancia de Cloud SQL (por defecto: library-db-instance)
  DATABASE_URL         Cadena de conexión usada por Cloud Run (obligatoria si no se usa PIPELINE_SCRIPT)
  JWT_SECRET           Secreto JWT usado por la aplicación (obligatorio si no se usa PIPELINE_SCRIPT)
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_ID=$2
      shift 2
      ;;
    --region)
      REGION=$2
      shift 2
      ;;
    --service)
      SERVICE_NAME=$2
      shift 2
      ;;
    --pipeline-script)
      PIPELINE_SCRIPT=$2
      shift 2
      ;;
    --health-url)
      HEALTH_URL=$2
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Argumento no reconocido: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! command -v gcloud >/dev/null 2>&1; then
  echo "❌ gcloud CLI no está disponible en el entorno actual." >&2
  exit 1
fi

echo "🔍 Verificando existencia del servicio ${SERVICE_NAME} en ${PROJECT_ID}/${REGION}..."
if ! gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  echo "❌ El servicio ${SERVICE_NAME} no existe en la región ${REGION} del proyecto ${PROJECT_ID}." >&2
  exit 1
fi

echo "🧹 Limpiando comando y argumentos sobrescritos..."
gcloud run services update "${SERVICE_NAME}" \
  --clear-command \
  --clear-args \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --quiet

echo "🚀 Iniciando despliegue mediante pipeline..."
if [[ -x "${PIPELINE_SCRIPT}" ]]; then
  "${PIPELINE_SCRIPT}" "${PROJECT_ID}"
else
  echo "ℹ️ Script ${PIPELINE_SCRIPT} no es ejecutable o no existe. Usando gcloud builds submit por defecto."
  if [[ -z "${DATABASE_URL}" || -z "${JWT_SECRET}" || "${JWT_SECRET}" == "define-un-secreto-robusto" ]]; then
    echo "❌ Debes proporcionar DATABASE_URL y JWT_SECRET válidos a través de variables de entorno para usar gcloud builds submit." >&2
    exit 1
  fi
  gcloud builds submit \
    --config cloudbuild.yaml \
    --project "${PROJECT_ID}" \
    --substitutions=_SERVICE_NAME="${SERVICE_NAME}",_REGION="${REGION}",_ARTIFACT_REPOSITORY="${ARTIFACT_REPOSITORY}",_IMAGE_TAG="${IMAGE_TAG}",_INSTANCE_NAME="${INSTANCE_NAME}",_DATABASE_URL="${DATABASE_URL}",_JWT_SECRET="${JWT_SECRET}" \
    --quiet
fi

echo "🆕 Obteniendo revisión actualizada..."
LATEST_REVISION=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format='value(status.latestCreatedRevisionName)')

if [[ -z "${LATEST_REVISION}" ]]; then
  echo "❌ No se pudo determinar la última revisión desplegada." >&2
  exit 1
fi

echo "🔎 Validando configuración del contenedor en la revisión ${LATEST_REVISION}..."
COMMAND_VALUE=$(gcloud run revisions describe "${LATEST_REVISION}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format='value(spec.containers[0].command)')

if [[ -n "${COMMAND_VALUE}" ]]; then
  echo "⚠️ La revisión ${LATEST_REVISION} aún muestra un comando sobrescrito: ${COMMAND_VALUE}" >&2
else
  echo "✅ El campo de comando se encuentra vacío según la revisión activa."
fi

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format='value(status.url)')

echo "🌐 URL del servicio: ${SERVICE_URL:-No disponible}"

TARGET_HEALTH_URL=${HEALTH_URL:-${SERVICE_URL:+${SERVICE_URL}/health}}

if [[ -n "${TARGET_HEALTH_URL}" ]]; then
  echo "🩺 Ejecutando comprobación de salud contra ${TARGET_HEALTH_URL}..."
  if curl --fail --show-error --silent "${TARGET_HEALTH_URL}" >/dev/null; then
    echo "✅ La sonda de salud respondió correctamente."
  else
    echo "⚠️ La sonda de salud no respondió exitosamente." >&2
    exit 1
  fi
else
  echo "⚠️ No se pudo determinar la URL para la comprobación de salud. Skipping." >&2
fi

echo "🎉 Proceso completado."
