# Presentation Builder

A full-stack web application for creating, managing, and presenting slide-based presentations with media support. Built as an Nx monorepo with a NestJS backend, Next.js frontend, and a shared library.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Local Setup Instructions](#local-setup-instructions)
- [API Overview](#api-overview)
- [Key Design Decisions & Trade-offs](#key-design-decisions--trade-offs)
- [Known Limitations](#known-limitations)

---

## Project Overview

Presentation Builder is a self-hosted presentation tool that allows users to:

- **Create & manage projects** — each project represents a presentation with a title, description, and version
- **Build slides** — add text content, upload images or videos (up to 500 MB), and reorder slides via drag-and-drop
- **Configure global branding** — set company name, logo, address, email, and website that appear on presentation headers
- **Present fullscreen** — a polished presentation mode with animated slide transitions, keyboard navigation, and a progress bar
- **First-time setup wizard** — guides users through initial global settings configuration before accessing the dashboard

### Monorepo Structure

```
presentation-builder-app/
├── apps/
│   ├── backend/          # NestJS + Fastify API server
│   └── frontend/         # Next.js 16 App Router frontend
├── libs/                 # Shared library (DTOs, UI components, utils)
├── docker/               # Nginx config, SSL certs, Certbot
├── docs/                 # Deployment documentation
├── docker-compose.yml    # Local development
└── docker-compose.prod.yml # Production deployment
```

---

## Tech Stack

### Backend

| Technology | Purpose |
|:---:|:---:|
| <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" /> | Application framework (v11) |
| <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify" /> | HTTP server adapter (v5) |
| <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /> | ORM & database toolkit (v7) |
| <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /> | Relational database (v16) |
| <img src="https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white" alt="MinIO" /> | S3-compatible object storage |
| <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" /> | Schema validation (v4) |
| <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" /> | API documentation (OpenAPI 3.0.3) |

### Frontend

| Technology | Purpose |
|:---:|:---:|
| <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /> | React framework with App Router (v16) |
| <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /> | UI library (v19) |
| <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /> | Type-safe JavaScript (v5.9) |
| <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /> | Utility-first CSS (v4) |
| <img src="https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white" alt="Radix UI" /> | Headless accessible UI primitives |
| <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" /> | Pre-built component library |
| <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" /> | Server state management (v5) |
| <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" /> | HTTP client |
| <img src="https://img.shields.io/badge/Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Motion" /> | Slide transition animations |
| <img src="https://img.shields.io/badge/dnd--kit-000000?style=for-the-badge" alt="dnd-kit" /> | Drag-and-drop slide reordering |

### Infrastructure & Tooling

| Technology | Purpose |
|:---:|:---:|
| <img src="https://img.shields.io/badge/Nx-143055?style=for-the-badge&logo=nx&logoColor=white" alt="Nx" /> | Monorepo build system (v22.5) |
| <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" /> | Package manager |
| <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /> | Containerization |
| <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" /> | Reverse proxy & SSL termination |
| <img src="https://img.shields.io/badge/Let's_Encrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white" alt="Let's Encrypt" /> | Free SSL certificates (Certbot) |
| <img src="https://img.shields.io/badge/SWC-F8C457?style=for-the-badge" alt="SWC" /> | Fast TypeScript/JavaScript compiler |
| <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" /> | Code linting |
| <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" /> | Testing framework |

---

## Local Setup Instructions

### Prerequisites

- **Node.js** ≥ 22
- **pnpm** ≥ 9
- **Docker** & **Docker Compose**

### 1. Clone the repository

```bash
git clone <repository-url>
cd presentation-builder-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start infrastructure services

This starts PostgreSQL and MinIO in Docker:

```bash
docker compose up -d postgres minio
```

### 4. Set up environment variables

Create `apps/backend/.env`:

```env
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/presentation_builder?schema=public

# MinIO
MINIO_HOST=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=presentation-builder
MINIO_PUBLIC_URL=http://localhost:9000

NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 5. Generate Prisma client & run migrations

```bash
cd apps/backend
npx prisma generate
npx prisma db push
cd ../..
```

### 6. Start development servers

```bash
# Backend (runs on http://localhost:3000)
npx nx serve backend

# Frontend (runs on http://localhost:4200)
npx nx dev frontend
```

Or start both with Docker (backend only, frontend runs locally):

```bash
docker compose up -d
npx nx dev frontend
```

### 7. Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api/v1 |
| Swagger Docs | http://localhost:3000/api/docs |
| MinIO Console | http://localhost:9001 |

---

## API Overview

The backend exposes a RESTful API under `/api/v1`. Full interactive documentation is available via **Swagger UI** at `/api/docs`.

For the complete OpenAPI 3.0.3 specification, see [`apps/backend/src/swagger/openapi.yaml`](apps/backend/src/swagger/openapi.yaml).

### Endpoints Summary

#### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects` | List all projects |
| `GET` | `/projects/:id` | Get a single project |
| `GET` | `/projects/:id/presentation` | Get project with all slides (for presentation mode) |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Soft-delete a project |

#### Slides

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/slides/project/:projectId` | Create a slide (auto-assigns order) |
| `GET` | `/slides/project/:projectId` | List all slides for a project |
| `PATCH` | `/slides/project/:projectId/reorder` | Reorder slides by ID array |
| `GET` | `/slides/:id` | Get a single slide |
| `PUT` | `/slides/:id` | Update a slide |
| `DELETE` | `/slides/:id` | Soft-delete a slide |

#### Global Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/global-settings` | Create settings (multipart: logo + fields) |
| `GET` | `/global-settings` | Get current settings |
| `PATCH` | `/global-settings` | Update settings (multipart: logo + fields) |

#### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload media file (image/video, max 500 MB) |

---

## Key Design Decisions & Trade-offs

### 1. Hexagonal Architecture (Backend)

The backend follows a **Ports & Adapters** pattern — each domain module (Projects, Slides, Global Settings) is structured as:

```
controller → service → port (interface) → repository (implementation)
```

This clean separation of concerns makes it straightforward to swap out infrastructure (e.g., replacing MinIO with AWS S3) without touching business logic. The trade-off is slightly more boilerplate per module.

### 2. Soft Deletes

All entities (Projects, Slides, Global Settings) use soft deletes via a `deletedAt` timestamp rather than hard deletes. The Prisma service provides helper methods (`softDelete`, `findManyActive`, `findFirstActive`) that automatically filter out deleted records. This makes data recovery possible without backups. The trade-off is that queries need to be aware of the `deletedAt` filter, and storage grows over time.

### 3. Fastify over Express

The backend uses **Fastify** instead of NestJS's default Express adapter. Fastify provides significantly better throughput and lower overhead, which matters on a resource-constrained VPS. The trade-off is a smaller middleware ecosystem compared to Express.

### 4. MinIO for Object Storage

Media files are stored in **MinIO** (self-hosted S3-compatible storage) rather than the filesystem or a cloud provider. The S3-compatible API means easy migration to AWS S3 or any S3-compatible provider in the future. Bucket-level public read policies simplify direct browser access to media. The trade-off is an additional service to run and maintain.

### 5. Shared Library with Dual Entry Points

The shared `libs/` package exposes two entry points:
- `index.ts` — full exports including React components & hooks (for frontend)
- `server.ts` — backend-safe exports without any React/JSX (for backend)

Both apps can share Zod DTOs, interfaces, and utilities while keeping React code out of the Node.js backend bundle. This avoids "module not found" errors for JSX in server environments.

### 6. Zod for Validation (Both Ends)

Zod schemas are defined once in the shared library and used by both the NestJS backend (via `nestjs-zod`) and the frontend for type inference. This gives a single source of truth for validation rules — TypeScript types are inferred from Zod schemas, eliminating drift between runtime validation and compile-time types.

### 7. TanStack Query for Server State

The frontend uses **TanStack React Query** rather than Redux or Zustand for server state management. Built-in caching, background refetching, optimistic updates, and cache invalidation handle the most common data-fetching patterns with minimal boilerplate. The trade-off is that complex client-only state still needs separate handling (though this app has very little of it).

### 8. CI/CD Pipeline (GitHub Actions)

The project uses **GitHub Actions** with separate workflows for CI checks and deployment:

- **CI** — runs lint, test, build, typecheck, and format checks via `nx run-many` with Nx Cloud task distribution across multiple agents for faster feedback.
- **Backend deployment** — triggered on pushes to `main` that touch `apps/backend/`, `libs/`, or dependency files. Copies the source to the Digital Ocean Droplet via SCP, then SSHs in to rebuild containers with `docker compose`, run database migrations, and prune dangling images.
- **Frontend deployment** — triggered on pushes to `main` that touch `apps/frontend/` or `libs/`. Builds a Docker image, pushes it to GCP Artifact Registry, and deploys to **Google Cloud Run** in `asia-southeast1` using Workload Identity Federation for keyless authentication.

Both deploy workflows also support `workflow_dispatch` for manual triggers. Path-based filtering ensures only the affected service gets redeployed when changes are pushed.

---

## Known Limitations

### Deployment & Infrastructure Constraints

The backend is currently deployed on a **Digital Ocean Droplet with 1 CPU and 1 GB RAM**, while the frontend runs on **Google Cloud Run (GCP)**. The DO Droplet's limited resources introduce several real-world limitations:

- **Long deployment times** — Docker image builds (especially the multi-stage Node.js builds for both frontend and backend) are extremely slow on a single-core machine with limited memory. A full rebuild can take **15–30+ minutes** as the build process frequently hits memory pressure, and the CPU is fully saturated during TypeScript compilation, Prisma generation, and Next.js static optimization. Pulling large base images also bottlenecks on the constrained network and I/O.

- **Memory pressure during builds** — With only 1 GB of RAM, running `docker compose build` can cause the OOM killer to terminate build processes. A swap file is essentially required to avoid failed builds. Even with swap, the heavy disk I/O from swapping significantly degrades build performance.

- **Limited concurrency** — The single CPU core means the backend, frontend, PostgreSQL, MinIO, and Nginx all compete for the same resources. Under moderate traffic, response times can spike as containers contend for CPU time. There is no horizontal scaling — everything runs on a single machine.

- **Cold start latency** — After a deployment or container restart, the first few requests may be noticeably slower as Node.js JIT-compiles the application and connection pools initialize. On a 1-core machine this warm-up period is more pronounced.

- **Large file uploads** — While the application supports uploads up to 500 MB, processing large video files on a 1 CPU / 1 GB RAM server can be unreliable. The Fastify body parser and MinIO upload may time out or exhaust memory under heavy upload load.

- **Backend downtime during deploys** — The GitHub Actions backend deploy workflow stops and rebuilds containers on the Droplet, meaning there is **brief downtime** during each redeploy. There is no blue-green or rolling deployment strategy on the DO Droplet.

- **Frontend cold starts (Cloud Run)** — Cloud Run scales to zero when idle. After a period of inactivity, the first request triggers a cold start where a new container instance must be provisioned and the Next.js server initialized, resulting in higher latency for that initial request.

### Application Limitations

- **No authentication/authorization** — The application is currently open access with no user accounts or role-based access control
- **No real-time collaboration** — Only single-user editing is supported; there are no WebSocket-based live collaboration features
- **No export functionality** — Presentations cannot be exported to PDF, PPTX, or other formats
- **No slide templates** — All slides are built from scratch; there is no template gallery or theme system
- **No undo/redo** — The slide editor does not support undoing or redoing changes
