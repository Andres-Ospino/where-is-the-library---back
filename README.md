# Library Management System

Plataforma para la gestión de bibliotecas construida con NestJS y TypeScript. El proyecto sigue una arquitectura hexagonal que
aísla el dominio de los adaptadores y utiliza **TypeORM con PostgreSQL** como capa de persistencia. Esta base permite ejecutar
la aplicación tanto en entornos locales con Docker como en despliegues gestionados en Google Cloud Run.

## 🏗️ Arquitectura

```
src/
├─ app.module.ts             # Configuración principal de NestJS
├─ core/                     # Capacidades transversales
│  ├─ database/              # Configuración TypeORM (PostgreSQL/SQLite en tests)
│  ├─ filters/               # Filtros globales de excepciones
│  └─ providers/             # Servicios compartidos (fecha, hashing, bus de eventos)
├─ modules/
│  ├─ auth/                  # Autenticación JWT y guard global
│  ├─ catalog/               # Gestión de libros
│  │  ├─ domain/             # Entidades y puertos
│  │  ├─ application/        # Casos de uso
│  │  └─ infrastructure/     # Controladores y repositorios TypeORM
│  ├─ members/               # Gestión de miembros y hashing de contraseñas
│  └─ loans/                 # Préstamos y devoluciones de libros
└─ shared/                   # DTOs, errores y utilidades comunes
```

## 🚀 Características

- **Gestión de libros**: crear, listar, actualizar y eliminar títulos disponibles en la biblioteca.
- **Gestión de miembros**: registro seguro con hashing PBKDF2 y consulta de miembros registrados.
- **Sistema de préstamos**: flujo completo de préstamo y devolución con control de disponibilidad.
- **Persistencia con TypeORM**: adaptadores preparados para PostgreSQL y soporte SQLite en pruebas automáticas.
- **Autenticación JWT**: guardia global con decorador `@Public` para exponer rutas abiertas (p. ej. login o alta de miembros).
- **Documentación Swagger**: disponible en la ruta raíz con descarga de colección Postman.
- **Pruebas E2E**: automatizadas con Jest utilizando una base de datos efímera en memoria.
- **Observabilidad**: logging estructurado con `nestjs-pino` y formato legible en desarrollo.
- **Docker & Cloud Ready**: configuraciones para Docker Compose y despliegue en Cloud Run/Cloud SQL.

## 🛠️ Stack Tecnológico

- **Framework**: NestJS (TypeScript en modo estricto).
- **Persistencia**: TypeORM + PostgreSQL (SQLite para entorno de pruebas).
- **Autenticación**: Passport + JWT.
- **Validación**: `class-validator` + `class-transformer`.
- **Documentación**: `@nestjs/swagger` + `swagger-ui-express`.
- **Observabilidad**: `nestjs-pino`.
- **Pruebas**: Jest + Supertest.
- **Gestión de paquetes**: pnpm.

## 📋 Prerrequisitos

- Node.js 18+
- pnpm (habilitado vía Corepack: `corepack enable`)
- PostgreSQL 15+ (local o gestionado) si no utilizas Docker
- Docker & Docker Compose (opcional para desarrollo)
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

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env
```

Variables principales:

- `PORT`: puerto de la API (por defecto 8080)
- `JWT_SECRET`: secreto para firmar tokens JWT
- `DATABASE_URL`: URL de conexión PostgreSQL (por ejemplo `postgresql://user:password@localhost:5432/library_db`)
- `ALLOWED_ORIGINS`: lista separada por comas de orígenes permitidos para CORS

Para pruebas automáticas existe `.env.test`, que ya apunta a una base de datos SQLite en memoria.

### 3. Ejecutar en desarrollo

```bash
pnpm run dev
```

La API quedará disponible en `http://localhost:3000` con documentación Swagger en `/`.

### 4. Ejecutar pruebas

```bash
pnpm test
pnpm test:e2e
```

| Comando | Descripción |
| --- | --- |
| `pnpm test` | Ejecuta todo el conjunto de pruebas unitarias (casos de uso y entidades de catálogo, préstamos, socios y autenticación). |
| `pnpm test -- --testPathPattern="members"` | Filtra las pruebas unitarias relacionadas con el módulo de socios (entidades y casos de uso). |
| `pnpm test -- --testPathPattern="auth"` | Ejecuta únicamente las pruebas unitarias del módulo de autenticación (login). |
| `pnpm test -- --testPathPattern="loans"` | Limita la ejecución a las pruebas unitarias de préstamos (incluye loan-book, return-book y list-loans). |
| `pnpm test:e2e` | Lanza todas las suites end-to-end (libros, préstamos, socios y login). |
| `pnpm test:e2e -- --testPathPattern="members"` | Ejecuta solamente la suite end-to-end de `/members`. |
| `pnpm test:e2e -- --testPathPattern="auth"` | Ejecuta únicamente la suite end-to-end de `/auth/login`. |

Las pruebas end-to-end inicializan TypeORM en modo SQLite en memoria, por lo que no requieren servicios externos.

## 🐳 Uso con Docker Compose

Para levantar PostgreSQL y la API en modo producción simplificado:

```bash
docker compose up -d
```

Para un entorno de desarrollo con recarga en caliente:

```bash
docker compose -f docker-compose.dev.yml up -d
```

El archivo `scripts/database-setup.json` incluye comandos útiles para iniciar PostgreSQL y aplicar el script `scripts/init-database.sql` que crea las tablas necesarias.

## ☁️ Despliegue en Google Cloud Run

1. Ejecuta `scripts/setup-gcp.sh <PROJECT_ID>` para habilitar APIs y crear el repositorio de Artifact Registry. Asegúrate de definir `JWT_SECRET` y `DATABASE_URL` en `.env.gcloud.local`.
2. Lanza `scripts/deploy-cloud-run.sh <PROJECT_ID>` para construir la imagen con Cloud Build y desplegarla en Cloud Run. El script establece las variables de entorno `NODE_ENV`, `PORT`, `JWT_SECRET` y `DATABASE_URL`.
3. Si necesitas reiniciar la configuración del servicio sin cambios de imagen, utiliza `scripts/reset-cloud-run-backend.sh`.

## 📚 Recursos adicionales

- **Swagger UI**: `http://localhost:3000/`
- **Colección Postman**: disponible en `/postman-collection`
- **Script de inicialización**: `scripts/init-database.sql`

---

Si encuentras un conflicto al fusionar ramas, revisa las instrucciones de este README para validar que tu entorno cumpla con los requisitos (especialmente `DATABASE_URL`).
