# Library Management System

<<<<<<< HEAD
A comprehensive library management system built with NestJS and TypeScript. The platform applies Clean Architecture and SOLID principles and now persists information with in-memory repositories, which simplifies local development and automated testing.
=======
Una plataforma completa para la gestión de bibliotecas construida con NestJS y TypeScript. La aplicación sigue principios de Arquitectura Limpia/Hexagonal y ahora utiliza **TypeORM con PostgreSQL** como capa de persistencia, lo que permite integrarse con instancias de Google Cloud SQL sin sacrificar la separación por capas.
>>>>>>> origin/codex/remove-prisma-ldugxq

## 🏗️ Arquitectura

<<<<<<< HEAD
This project follows Clean (Hexagonal) Architecture with clear separation of concerns:

```
src/
├─ core/                    # Cross-cutting concerns
│  ├─ providers/           # Date provider & event bus
│  └─ filters/             # Global exception filter
├─ modules/
│  ├─ catalog/             # Books management
│  │  ├─ domain/           # Entities + ports (interfaces)
│  │  ├─ application/      # Use cases
│  │  └─ infrastructure/   # Controllers + repositories (in-memory)
│  ├─ members/             # Members management
│  └─ loans/               # Loans management
└─ shared/                 # DTOs, errors, utilities
=======
El proyecto mantiene los límites de capas definidos en la arquitectura hexagonal:

```
src/
├─ core/                    # Capacidades transversales
│  ├─ database/            # Configuración TypeORM + proveedores
│  ├─ providers/           # Date provider & event bus
│  └─ filters/             # Filtros globales
├─ modules/
│  ├─ catalog/             # Gestión de libros
│  │  ├─ domain/           # Entidades + puertos (interfaces)
│  │  ├─ application/      # Casos de uso
│  │  └─ infrastructure/   # Controladores + repositorios TypeORM
│  ├─ members/             # Gestión de miembros
│  └─ loans/               # Gestión de préstamos
└─ shared/                 # DTOs, errores, utilidades comunes
>>>>>>> origin/codex/remove-prisma-ldugxq
```

## 🚀 Características

<<<<<<< HEAD
- **Books Management**: Create, list, update and delete books
- **Members Management**: Register and manage library members
- **Loans System**: Loan books to members with return tracking
- **Clean Architecture**: Domain-driven design with dependency inversion
- **Domain Events**: Event-driven architecture for business events
- **Comprehensive Testing**: Unit and end-to-end tests
- **Token-based Authentication**: Secure JWT login and authorization guard ready for front-end integration
- **Docker Support**: Containerized deployment
- **Cloud Ready**: Google Cloud Run deployment configuration
=======
- **Gestión de libros**: crear, listar, actualizar y eliminar libros.
- **Gestión de miembros**: registrar y consultar miembros.
- **Sistema de préstamos**: préstamo y devolución de libros con seguimiento del estado.
- **Persistencia con TypeORM**: repositorios adaptados a PostgreSQL/Cloud SQL.
- **Arquitectura limpia**: dominio aislado mediante puertos y adaptadores.
- **Eventos de dominio**: publicación a través de un bus de eventos in-process.
- **Pruebas E2E**: verificaciones automatizadas de los flujos principales con base de datos efímera (SQLite en modo test).
- **Soporte Docker y Cloud Run**: contenedores listos para despliegue gestionado en Google Cloud.
>>>>>>> origin/codex/remove-prisma-ldugxq

## 🛠️ Stack Tecnológico

<<<<<<< HEAD
- **Framework**: NestJS with TypeScript (strict mode)
- **Persistence**: In-memory repositories (no external database required)
- **Architecture**: Clean Architecture / Hexagonal Architecture
- **Testing**: Jest (unit + e2e tests)
- **Containerization**: Docker & Docker Compose
- **Cloud**: Google Cloud Run
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier
=======
- **Framework**: NestJS (TypeScript, modo estricto).
- **Persistencia**: TypeORM + PostgreSQL (compatible con Google Cloud SQL).
- **Pruebas**: Jest (unitarias y end-to-end).
- **Infraestructura**: Docker, Docker Compose, Google Cloud Run, Cloud SQL.
- **Observabilidad**: `nestjs-pino` para logging estructurado.
- **Gestión de paquetes**: pnpm.
>>>>>>> origin/codex/remove-prisma-ldugxq

## 📋 Prerrequisitos

- Node.js 18+
<<<<<<< HEAD
- pnpm (via Corepack included with Node.js 18+)
- Docker & Docker Compose (optional)
- Google Cloud SDK (for deployment)
=======
- pnpm (via Corepack incluido con Node.js 18+)
- PostgreSQL 15+ (local o gestionado)
- Docker & Docker Compose (opcional para desarrollo local)
- Google Cloud SDK (para despliegues en Cloud Run)
>>>>>>> origin/codex/remove-prisma-ldugxq

> 💡 Ejecuta `corepack enable` una sola vez en tu entorno para garantizar que pnpm esté disponible.

## 🚀 Puesta en marcha rápida

### 1. Clonar e instalar dependencias

```bash
git clone <repository-url>
cd library-management-system
corepack enable
pnpm install
```

<<<<<<< HEAD
### 2. Start Development Server

=======
### 2. Configurar la base de datos

#### Opción A: Docker Compose (recomendado)

```bash
docker compose -f docker-compose.dev.yml up -d postgres
# Espera a que PostgreSQL supere el healthcheck y luego crea el esquema
psql postgresql://library_user:library_password@localhost:5432/library_db -f scripts/init-database.sql
```

#### Opción B: PostgreSQL local o Cloud SQL

1. Crea la base de datos y usuario de la aplicación.
2. Ejecuta `scripts/init-database.sql` para generar tablas e índices.
3. Construye la cadena `DATABASE_URL`, por ejemplo:
   ```
   postgresql://library_user:S3cret@localhost:5432/library_db
   ```
   Para Cloud SQL con conexión por socket:
   ```
   postgresql://library_user:S3cret@/library_db?host=/cloudsql/<PROJECT_ID>:<REGION>:<INSTANCE_NAME>
   ```

### 3. Variables de entorno

Crea un archivo `.env` basado en `.env.example` o exporta las variables necesarias:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://library_user:library_password@localhost:5432/library_db
TYPEORM_LOGGING=false
JWT_SECRET=dev-secret
ALLOWED_ORIGINS=http://localhost:3000
```

El flag `TYPEORM_LOGGING` acepta `true`/`false` y habilita los logs de consultas, útil durante el desarrollo cuando necesitas
inspeccionar las operaciones SQL generadas por el ORM.

Para pruebas automáticas puedes usar `.env.test`, que se carga desde `test/setup.ts`.

### 4. Levantar el servidor en modo desarrollo

>>>>>>> origin/codex/remove-prisma-ldugxq
```bash
pnpm run dev
```

<<<<<<< HEAD
The API will be available at `http://localhost:3000`.

Because the application uses in-memory repositories, no database provisioning or environment variables are required for local development.
=======
La API quedará disponible en `http://localhost:3000`.
>>>>>>> origin/codex/remove-prisma-ldugxq

## 📚 Endpoints principales

- `GET /books` – Lista libros, admite filtros `title` y `author`.
- `POST /books` – Crea un libro.
- `GET /books/:id` – Recupera un libro.
- `PATCH /books/:id` – Actualiza título/autor.
- `DELETE /books/:id` – Elimina un libro (validando préstamos activos).
- `GET /members` / `POST /members` – Gestión de miembros.
- `GET /loans` – Consulta préstamos (`activeOnly`, `memberId`, `bookId`).
- `POST /loans` – Registra un nuevo préstamo.
- `POST /loans/:id/return` – Marca devolución.
- `GET /health` – Sonda de salud.

## 🧪 Pruebas

<<<<<<< HEAD
### Books
- `GET /books` - List all books (with optional title/author filters)
- `POST /books` - Create a new book
- `GET /books/:id` - Get book by ID
- `PATCH /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### Members
- `GET /members` - List all members (requires authentication)
- `POST /members` - Create a new member (`name`, `email` and `password`)

### Authentication
- `POST /auth/login` - Exchange email/password for a JWT access token (`Authorization: Bearer <token>`)

### Loans
- `GET /loans` - List loans (with optional filters)
- `POST /loans` - Create a new loan
- `POST /loans/:id/return` - Return a book

### Health Check
- `GET /health` - Application health status

## 🧪 Testing

```bash
# Unit tests
=======
```bash
# Pruebas unitarias
>>>>>>> origin/codex/remove-prisma-ldugxq
pnpm run test

# Pruebas end-to-end (usa SQLite en memoria)
pnpm run test:e2e

# Cobertura
pnpm run test:cov
<<<<<<< HEAD

# Watch mode
pnpm run test:watch
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker-compose up -d
```

## ☁️ Google Cloud Deployment

La API puede desplegarse en Google Cloud Run sin depender de Cloud SQL. Los pasos resumidos son:

1. Configura variables en `.env.gcloud.local` y define `PROJECT_ID`, `JWT_SECRET`, `REGION`, etc.
2. Construye y publica la imagen con Cloud Build:
   ```bash
   gcloud builds submit \
     --config cloudbuild.yaml \
     --project "$PROJECT_ID" \
     --substitutions=_SERVICE_NAME="library-management-system",_REGION="us-central1",_ARTIFACT_REPOSITORY="library-management-system",_IMAGE_TAG="latest",_JWT_SECRET="$JWT_SECRET"
   ```
3. Despliega la imagen en Cloud Run:
   ```bash
   gcloud run deploy library-management-system \
     --image us-central1-docker.pkg.dev/$PROJECT_ID/library-management-system/library-management-system:latest \
     --region us-central1 \
     --allow-unauthenticated \
     --platform managed \
     --set-env-vars NODE_ENV=production,PORT=8080,JWT_SECRET="$JWT_SECRET" \
     --project "$PROJECT_ID"
   ```

Los scripts `scripts/setup-gcp.sh`, `scripts/deploy-cloud-run.sh` y `scripts/reset-cloud-run-backend.sh` automatizan estas tareas y proporcionan validaciones adicionales (por ejemplo limpiar comandos personalizados antes del despliegue o verificar la salud del servicio tras la actualización).

## 📁 Project Structure

```
├── src/
│   ├── core/                 # Core infrastructure
│   ├── modules/              # Business modules
│   │   ├── catalog/          # Books domain
│   │   ├── members/          # Members domain
│   │   └── loans/            # Loans domain
│   ├── shared/               # Shared utilities
│   └── health/               # Health check
├── test/                     # Unit & E2E tests
├── scripts/                  # Deployment scripts
├── docker-compose*.yml       # Docker configurations
=======
```

## 🐳 Docker

### Desarrollo

```bash
docker compose -f docker-compose.dev.yml up -d
```
Esto levanta PostgreSQL y permite trabajar con `pnpm run dev` en tu máquina.

### Producción local

```bash
docker compose up -d
```
El contenedor de la aplicación se construye con la imagen del Dockerfile y se conecta al servicio PostgreSQL definido en el mismo archivo.

## ☁️ Despliegue en Google Cloud Run + Cloud SQL

1. Copia `.env.gcloud` a `.env.gcloud.local` y completa `PROJECT_ID`, `INSTANCE_NAME`, `DATABASE_URL`, `JWT_SECRET`.
2. Ejecuta `scripts/setup-gcp.sh` para habilitar APIs y crear el repositorio de Artifact Registry.
3. Construye y despliega con `scripts/deploy-cloud-run.sh <PROJECT_ID>`. El script:
   - Construye la imagen con Cloud Build.
   - Publica en Artifact Registry.
   - Despliega en Cloud Run configurando `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production` y `PORT=8080`.
4. Asegúrate de que la instancia de Cloud SQL permita conexiones desde Cloud Run (por socket o por VPC). El valor de `DATABASE_URL` debe incluir `?host=/cloudsql/…` si usas sockets Unix.

Para reinicios controlados puedes usar `scripts/reset-cloud-run-backend.sh`, que limpia overrides de comando y vuelve a desplegar.

## 📁 Estructura del proyecto

```
├── src/
│   ├── core/                 # Infraestructura compartida
│   ├── modules/              # Módulos de dominio
│   ├── shared/               # Utilidades
│   └── health/               # Endpoint de salud
├── test/                     # Pruebas unitarias y E2E
├── scripts/                  # Scripts de despliegue y base de datos
├── docker-compose*.yml       # Configuración Docker
>>>>>>> origin/codex/remove-prisma-ldugxq
└── README.md
```

## 🔒 Seguridad

<<<<<<< HEAD
1. **Domain Layer**: Pure business logic, no external dependencies
2. **Application Layer**: Use cases orchestrating domain objects
3. **Infrastructure Layer**: External concerns (HTTP controllers, in-memory persistence)
4. **Dependency Inversion**: High-level modules don't depend on low-level modules
=======
- Validaciones con `class-validator`/`class-transformer`.
- Manejo centralizado de excepciones con mapeo de errores de TypeORM.
- JWT (módulo base listo para integración futura).
- CORS configurable.
>>>>>>> origin/codex/remove-prisma-ldugxq

## 🤝 Contribuciones

<<<<<<< HEAD
- Input validation with class-validator
- Global exception handling
- CORS configuration
- JWT authentication (skeleton for future implementation)
- Docker security best practices

## 📈 Performance Considerations

- In-memory repositories for ultra-fast development feedback
- Multi-stage Docker builds
- Structured logging with pino
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
=======
1. Crea un branch de característica.
2. Implementa los cambios manteniendo los principios de arquitectura limpia.
3. Añade pruebas cuando corresponda.
4. Ejecuta el pipeline de pruebas (`pnpm run test` / `pnpm run test:e2e`).
5. Envía tu Pull Request.
>>>>>>> origin/codex/remove-prisma-ldugxq
