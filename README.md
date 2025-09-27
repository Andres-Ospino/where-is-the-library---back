# Library Management System

A comprehensive library management system built with NestJS and TypeScript. The platform applies Clean Architecture and SOLID principles and now persists information with in-memory repositories, which simplifies local development and automated testing.

## 🏗️ Architecture

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
```

## 🚀 Features

- **Books Management**: Create, list, update and delete books
- **Members Management**: Register and manage library members
- **Loans System**: Loan books to members with return tracking
- **Clean Architecture**: Domain-driven design with dependency inversion
- **Domain Events**: Event-driven architecture for business events
- **Comprehensive Testing**: Unit and end-to-end tests
- **Token-based Authentication**: Secure JWT login and authorization guard ready for front-end integration
- **Docker Support**: Containerized deployment
- **Cloud Ready**: Google Cloud Run deployment configuration

## 🛠️ Tech Stack

- **Framework**: NestJS with TypeScript (strict mode)
- **Persistence**: In-memory repositories (no external database required)
- **Architecture**: Clean Architecture / Hexagonal Architecture
- **Testing**: Jest (unit + e2e tests)
- **Containerization**: Docker & Docker Compose
- **Cloud**: Google Cloud Run
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+
- pnpm (via Corepack included with Node.js 18+)
- Docker & Docker Compose (optional)
- Google Cloud SDK (for deployment)

> 💡 Ejecuta `corepack enable` una vez en tu entorno para asegurarte de que pnpm esté disponible.

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd library-management-system
corepack enable
pnpm install
```

### 2. Start Development Server

```bash
pnpm run dev
```

The API will be available at `http://localhost:3000`.

Because the application uses in-memory repositories, no database provisioning or environment variables are required for local development.

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
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

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
└── README.md
```

## 🏛️ Clean Architecture Principles

1. **Domain Layer**: Pure business logic, no external dependencies
2. **Application Layer**: Use cases orchestrating domain objects
3. **Infrastructure Layer**: External concerns (HTTP controllers, in-memory persistence)
4. **Dependency Inversion**: High-level modules don't depend on low-level modules

## 🔒 Security Features

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
