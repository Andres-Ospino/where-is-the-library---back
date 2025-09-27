# Library Management System

Una plataforma completa para la gestión de bibliotecas construida con NestJS y TypeScript. La aplicación sigue principios de Arquitectura Limpia/Hexagonal y ahora utiliza **TypeORM con PostgreSQL** como capa de persistencia, lo que permite integrarse con instancias de Google Cloud SQL sin sacrificar la separación por capas.

## 🏗️ Arquitectura

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
```

## 🚀 Características

- **Gestión de libros**: crear, listar, actualizar y eliminar libros.
- **Gestión de miembros**: registrar y consultar miembros.
- **Sistema de préstamos**: préstamo y devolución de libros con seguimiento del estado.
- **Persistencia con TypeORM**: repositorios adaptados a PostgreSQL/Cloud SQL.
- **Arquitectura limpia**: dominio aislado mediante puertos y adaptadores.
- **Eventos de dominio**: publicación a través de un bus de eventos in-process.
- **Pruebas E2E**: verificaciones automatizadas de los flujos principales con base de datos efímera (SQLite en modo test).
- **Soporte Docker y Cloud Run**: contenedores listos para despliegue gestionado en Google Cloud.

## 🛠️ Stack Tecnológico

- **Framework**: NestJS (TypeScript, modo estricto).
- **Persistencia**: TypeORM + PostgreSQL (compatible con Google Cloud SQL).
- **Pruebas**: Jest (unitarias y end-to-end).
- **Infraestructura**: Docker, Docker Compose, Google Cloud Run, Cloud SQL.
- **Observabilidad**: `nestjs-pino` para logging estructurado.
- **Gestión de paquetes**: pnpm.

## 📋 Prerrequisitos

- Node.js 18+
- pnpm (via Corepack incluido con Node.js 18+)
- PostgreSQL 15+ (local o gestionado)
- Docker & Docker Compose (opcional para desarrollo local)
- Google Cloud SDK (para despliegues en Cloud Run)

> 💡 Ejecuta `corepack enable` una sola vez en tu entorno para garantizar que pnpm esté disponible.

## 🚀 Puesta en marcha rápida

### 1. Clonar e instalar dependencias

```bash
git clone <repository-url>
cd library-management-system
corepack enable
pnpm install
```

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

```bash
pnpm run dev
```

La API quedará disponible en `http://localhost:3000`.

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

```bash
# Pruebas unitarias
pnpm run test

# Pruebas end-to-end (usa SQLite en memoria)
pnpm run test:e2e

# Cobertura
pnpm run test:cov
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
└── README.md
```

## 🔒 Seguridad

- Validaciones con `class-validator`/`class-transformer`.
- Manejo centralizado de excepciones con mapeo de errores de TypeORM.
- JWT (módulo base listo para integración futura).
- CORS configurable.

## 🤝 Contribuciones

1. Crea un branch de característica.
2. Implementa los cambios manteniendo los principios de arquitectura limpia.
3. Añade pruebas cuando corresponda.
4. Ejecuta el pipeline de pruebas (`pnpm run test` / `pnpm run test:e2e`).
5. Envía tu Pull Request.
