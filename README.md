# Library Management System

A comprehensive library management system built with NestJS, TypeScript, Prisma, and PostgreSQL, implementing Clean Architecture and SOLID principles.

## 🏗️ Architecture

This project follows Clean Architecture (Hexagonal Architecture) with clear separation of concerns:

\`\`\`
src/
├─ core/                    # Cross-cutting concerns
│  ├─ database/            # Prisma configuration
│  ├─ providers/           # Date provider, Event bus
│  └─ filters/             # Global exception filter
├─ modules/
│  ├─ catalog/             # Books management
│  │  ├─ domain/           # Entities + Ports (interfaces)
│  │  ├─ application/      # Use cases
│  │  └─ infrastructure/   # Controllers + Repositories
│  ├─ members/             # Members management
│  └─ loans/               # Loans management
└─ shared/                 # DTOs, errors, utilities
\`\`\`

## 🚀 Features

- **Books Management**: Create, read, update, delete books
- **Members Management**: Register and manage library members
- **Loans System**: Loan books to members with return tracking
- **Clean Architecture**: Domain-driven design with dependency inversion
- **Database Transactions**: Atomic operations for loan/return processes
- **Domain Events**: Event-driven architecture for business events
- **Comprehensive Testing**: Unit and integration tests
- **Docker Support**: Containerized deployment
- **Cloud Ready**: Google Cloud Run deployment configuration

## 🛠️ Tech Stack

- **Framework**: NestJS with TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Architecture**: Clean Architecture / Hexagonal Architecture
- **Testing**: Jest (unit + e2e tests)
- **Containerization**: Docker & Docker Compose
- **Cloud**: Google Cloud Run + Cloud SQL
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+
- pnpm (vía Corepack incluido con Node.js 18+)
- PostgreSQL 15+
- Docker & Docker Compose (optional)
- Google Cloud SDK (for deployment)

> 💡 Ejecuta `corepack enable` una vez en tu entorno para asegurarte de que pnpm esté disponible.

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd library-management-system
corepack enable
pnpm install
\`\`\`

### 2. Database Setup

#### Option A: Using Docker (Recommended)
\`\`\`bash
# Start PostgreSQL with Docker Compose
docker-compose -f scripts/docker-compose.dev.yml up -d

# Wait for database to be ready, then run migrations
pnpm run prisma:migrate:dev
pnpm run prisma:seed
\`\`\`

#### Option B: Local PostgreSQL
\`\`\`bash
# Configure your DATABASE_URL in .env
cp .env.example .env
# Edit .env with your database credentials

# Run migrations and seed
pnpm run prisma:migrate:dev
pnpm run prisma:seed
\`\`\`

### 3. Start Development Server

\`\`\`bash
pnpm run dev
\`\`\`

The API will be available at `http://localhost:3000`

## 📦 Gestión de paquetes

Este proyecto utiliza **pnpm** como gestor de paquetes oficial. El contenedor Docker y la configuración de Cloud Build instalan las dependencias con `corepack pnpm install --frozen-lockfile`, garantizando que el `pnpm-lock.yaml` sea la fuente de la resolución de versiones. Ejecuta cualquier script definido en `package.json` mediante `pnpm run <script>` para mantener la coherencia con el entorno de despliegue.

## 📚 API Endpoints

### Books
- `GET /books` - List all books (with optional title/author filters)
- `POST /books` - Create a new book
- `GET /books/:id` - Get book by ID
- `PATCH /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### Members
- `GET /members` - List all members
- `POST /members` - Create a new member

### Loans
- `GET /loans` - List loans (with optional filters)
- `POST /loans` - Create a new loan
- `POST /loans/:id/return` - Return a book

### Health Check
- `GET /health` - Application health status

## 🧪 Testing

\`\`\`bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
\`\`\`

## 🐳 Docker Deployment

### Development
\`\`\`bash
docker-compose -f docker-compose.dev.yml up -d
\`\`\`

### Production
\`\`\`bash
docker-compose up -d
\`\`\`

## ☁️ Google Cloud Deployment

Esta guía unificada describe los pasos necesarios para desplegar la API en Google Cloud Run usando Cloud SQL y Artifact Registry. Puedes automatizar varias tareas con los scripts `scripts/setup-gcp.sh` y `scripts/deploy-cloud-run.sh`, pero aquí se detalla todo el proceso para que puedas verificar cada punto.

> 📄 Copia el archivo `.env.gcloud` incluido en el repositorio y actualiza sus valores antes de ejecutar los comandos:
> ```bash
> cp .env.gcloud .env.gcloud.local
> # Edita .env.gcloud.local para establecer PROJECT_ID, DATABASE_URL, JWT_SECRET, etc.
> source .env.gcloud.local
> ```

### 1. Preparar la configuración del proyecto y Artifact Registry
```bash
# Define el proyecto y la región por defecto
gcloud config set project "$PROJECT_ID"
gcloud config set run/region us-central1

# Habilita la autenticación de Artifact Registry en la región
gcloud auth configure-docker us-central1-docker.pkg.dev

# Crea (una sola vez) el repositorio Docker en Artifact Registry
gcloud artifacts repositories create library-management-system   --repository-format=docker   --location=us-central1   --description="Library Management System images"   --project "$PROJECT_ID"
```

> ℹ️ El repositorio y la imagen utilizados en toda la guía son `us-central1-docker.pkg.dev/$PROJECT_ID/library-management-system/library-management-system`.

### 2. Aprovisionar Cloud SQL (PostgreSQL)
```bash
# Activa las APIs necesarias
gcloud services enable run.googleapis.com cloudbuild.googleapis.com   artifactregistry.googleapis.com sqladmin.googleapis.com   --project "$PROJECT_ID"

# Crea la instancia de Cloud SQL (edición ENTERPRISE obligatoria para el tier utilizado)
gcloud sql instances create library-db-instance   --database-version=POSTGRES_15   --edition=ENTERPRISE   --tier=db-custom-1-3840   --storage-size=10   --region=us-central1   --project "$PROJECT_ID"
```

### 3. Crear base de datos y usuario de aplicación
```bash
# Base de datos de la aplicación
gcloud sql databases create library_db   --instance=library-db-instance   --project "$PROJECT_ID"

# Usuario dedicado con contraseña generada
DB_PASSWORD=$(openssl rand -base64 32)
gcloud sql users create library_user   --instance=library-db-instance   --password="$DB_PASSWORD"   --project "$PROJECT_ID"

echo "DATABASE_URL=postgresql://library_user:$DB_PASSWORD@/library_db?host=/cloudsql/$PROJECT_ID:us-central1:library-db-instance"
```

Actualiza tu `.env.gcloud.local` con la `DATABASE_URL` mostrada y un valor seguro para `JWT_SECRET`.

### 4. Configurar secretos para Cloud Build y Secret Manager
```bash
# (Opcional) Consulta los secretos existentes
gcloud secrets list --filter="name:library-database-url OR name:library-jwt-secret" --project "$PROJECT_ID"

# Crea los secretos si no existen todavía
printf '%s' "$DATABASE_URL" | gcloud secrets create library-database-url \
  --data-file=- \
  --replication-policy="automatic" \
  --project "$PROJECT_ID"

printf '%s' "$JWT_SECRET" | gcloud secrets create library-jwt-secret \
  --data-file=- \
  --replication-policy="automatic" \
  --project "$PROJECT_ID"

# Recupera el número del proyecto para referenciar la cuenta de Cloud Build
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

# Concede el rol Secret Manager Secret Accessor a Cloud Build sobre ambos secretos
gcloud secrets add-iam-policy-binding library-database-url \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project "$PROJECT_ID"

gcloud secrets add-iam-policy-binding library-jwt-secret \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project "$PROJECT_ID"

# Actualiza las sustituciones del trigger o del comando manual
gcloud builds submit \
  --config cloudbuild.yaml \
  --project "$PROJECT_ID" \
  --substitutions=_DATABASE_URL="projects/$PROJECT_ID/secrets/library-database-url/versions/latest",_JWT_SECRET="projects/$PROJECT_ID/secrets/library-jwt-secret/versions/latest"
```

> ✅ Cuando revises los logs de Cloud Build, confirma que el paso **Validación de variables obligatorias** aparezca como "done" antes del despliegue. Si falla, vuelve a verificar los valores guardados en Secret Manager y los permisos asignados a la cuenta de Cloud Build.

### 5. Construir la imagen con Cloud Build
```bash
gcloud builds submit   --config cloudbuild.yaml   --project "$PROJECT_ID"   --substitutions=_DATABASE_URL="$DATABASE_URL",_JWT_SECRET="$JWT_SECRET"
```

El pipeline usa `corepack pnpm` (igual que el Dockerfile) y publica la imagen en Artifact Registry antes de desplegarla.

### 6. Desplegar en Cloud Run con Cloud SQL adjunto
```bash
gcloud run deploy library-management-system   --image us-central1-docker.pkg.dev/$PROJECT_ID/library-management-system/library-management-system:latest   --region us-central1   --allow-unauthenticated   --add-cloudsql-instances $PROJECT_ID:us-central1:library-db-instance   --set-env-vars DATABASE_URL="$DATABASE_URL",JWT_SECRET="$JWT_SECRET",NODE_ENV=production,PORT=8080   --project "$PROJECT_ID"
```

### 7. Ejecutar migraciones y seed con un Cloud Run Job
```bash
# Crear el job la primera vez
gcloud run jobs create library-management-system-db-setup   --image us-central1-docker.pkg.dev/$PROJECT_ID/library-management-system/library-management-system:latest   --region us-central1   --add-cloudsql-instances $PROJECT_ID:us-central1:library-db-instance   --set-env-vars DATABASE_URL="$DATABASE_URL",JWT_SECRET="$JWT_SECRET",NODE_ENV=production   --command sh   --args -c   --args "pnpm prisma migrate deploy && pnpm prisma seed"   --project "$PROJECT_ID"

# Para actualizarlo tras cambios en la imagen
gcloud run jobs update library-management-system-db-setup   --image us-central1-docker.pkg.dev/$PROJECT_ID/library-management-system/library-management-system:latest   --region us-central1   --add-cloudsql-instances $PROJECT_ID:us-central1:library-db-instance   --set-env-vars DATABASE_URL="$DATABASE_URL",JWT_SECRET="$JWT_SECRET",NODE_ENV=production   --command sh   --args -c   --args "pnpm prisma migrate deploy && pnpm prisma seed"   --project "$PROJECT_ID"

# Ejecuta el job tras desplegar cambios de base de datos
gcloud run jobs execute library-management-system-db-setup   --region us-central1   --project "$PROJECT_ID"
```
> ✅ Los scripts de `scripts/setup-gcp.sh` y `scripts/deploy-cloud-run.sh` siguen estos mismos pasos y parámetros. Úsalos cuando quieras automatizar el proceso completo.

### 8. Restaurar el comando por defecto y validar la salud del servicio

Cuando Cloud Run conserva un comando personalizado (`ENTRYPOINT`) diferente al definido en el Dockerfile, el contenedor puede iniciar con parámetros incorrectos. El script `scripts/reset-cloud-run-backend.sh` ejecuta el flujo completo para limpiar el comando sobrescrito, desplegar la última imagen y validar la salud del servicio en un solo paso.

```bash
# Limpia overrides, redeploya con el pipeline existente y ejecuta la sonda /health
scripts/reset-cloud-run-backend.sh \
  --project where-is-the-library \
  --region us-central1 \
  --service backend

# Si necesitas una URL distinta para la sonda, añade --health-url "https://<url-personalizada>/health"
```

El script realiza las siguientes acciones:

1. Confirma que el servicio exista antes de modificarlo.
2. Ejecuta `gcloud run services update --clear-command --clear-args` para eliminar cualquier override manual.
3. Vuelve a desplegar utilizando `scripts/deploy-cloud-run.sh` (o `gcloud builds submit` si el script no está disponible).
4. Comprueba que la revisión activa muestre el campo **Comando** vacío en la configuración del contenedor.
5. Obtiene la URL pública del servicio y lanza `curl .../health` para asegurarse de que NestJS responde escuchando en el puerto 8080.
## 🔧 Database Management

\`\`\`bash
# Generate Prisma client
pnpm run prisma:generate

# Create and apply migration
pnpm run prisma:migrate:dev

# Deploy migrations to production
pnpm run prisma:migrate:deploy

# Seed database
pnpm run prisma:seed

# Open Prisma Studio
pnpm run prisma:studio
\`\`\`

## 📁 Project Structure

\`\`\`
├── src/
│   ├── core/                 # Core infrastructure
│   ├── modules/              # Business modules
│   │   ├── catalog/          # Books domain
│   │   ├── members/          # Members domain
│   │   └── loans/            # Loans domain
│   ├── shared/               # Shared utilities
│   └── health/               # Health check
├── prisma/                   # Database schema & migrations
├── test/                     # E2E tests
├── scripts/                  # Deployment scripts
└── docker-compose*.yml       # Docker configurations
\`\`\`

## 🏛️ Clean Architecture Principles

1. **Domain Layer**: Pure business logic, no external dependencies
2. **Application Layer**: Use cases orchestrating domain objects
3. **Infrastructure Layer**: External concerns (database, HTTP, etc.)
4. **Dependency Inversion**: High-level modules don't depend on low-level modules

## 🔒 Security Features

- Input validation with class-validator
- Global exception handling
- CORS configuration
- JWT authentication (skeleton for future implementation)
- Database connection security
- Docker security best practices

## 📈 Performance Optimizations

- Database indexes on frequently queried fields
- Connection pooling with Prisma
- Multi-stage Docker builds
- Efficient query patterns
- Proper error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs

---

Built with ❤️ using NestJS and Clean Architecture principles.
