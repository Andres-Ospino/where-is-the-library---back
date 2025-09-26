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

### 1. Setup GCP Resources
\`\`\`bash
# Make script executable and run
chmod +x scripts/setup-gcp.sh
./scripts/setup-gcp.sh your-project-id
\`\`\`

### 2. Deploy to Cloud Run
\`\`\`bash
# Make script executable and run
chmod +x scripts/deploy-cloud-run.sh
./scripts/deploy-cloud-run.sh your-project-id
\`\`\`

### 3. Environment Variables for Cloud Run
Set these in Google Cloud Console or via gcloud CLI:

\`\`\`bash
DATABASE_URL="postgresql://user:password@/database?host=/cloudsql/project:region:instance"
JWT_SECRET="your-secure-jwt-secret"
NODE_ENV="production"
PORT="8080"
\`\`\`

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
