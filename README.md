# CommentsApp

A full-stack, microservices-based comments platform with authentication, voting, reporting, file uploads, AI translation, real-time notifications, and daily email statistics.

---

## Table of Contents

1. [Getting Started (From Zero to Running)](#1-getting-started-from-zero-to-running)
2. [Project Structure](#2-project-structure)
3. [Docker & Services Overview](#3-docker--services-overview)
4. [Environment Variables (.env)](#4-environment-variables-env)
5. [Useful Commands](#5-useful-commands)
6. [Architecture Notes](#6-architecture-notes)

---

## 1. Getting Started (From Zero to Running)

This section contains a complete, step-by-step guide to set up and run the application on both **Windows** and **Linux/macOS**.

### Prerequisites

Install the following tools:

| Tool | Version / Notes | Windows | Linux / macOS |
|------|-----------------|---------|---------------|
| **Docker Desktop** (or Docker Engine + Docker Compose) | Latest stable | [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) | Install via package manager or Docker Desktop |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | `sudo apt install git` / `brew install git` |
| **Node.js** (optional, only for local development outside Docker) | 20.x LTS | [nodejs.org](https://nodejs.org/) | `nvm install 20` |
| **OpenSSL** (for generating JWT RSA keys) | Usually pre-installed | Comes with Git Bash / WSL | Pre-installed on most systems |

> **Important**: Make sure Docker is running before continuing.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/ihor-solod-dev/CommentsApp.git
cd CommentsApp
```

### Step 2 — Create the `.env` File

Copy the example file:

```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Open `.env` in any text editor and configure the values as described below.

#### Which values can stay as in `.env.example`?

For local development you can keep most values unchanged:

- `NODE_ENV=development`
- `POSTGRES_DB=comments_db`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres_secret`
- `REDIS_PASSWORD=redis_secret`
- `RABBITMQ_USER=rabbit`
- `RABBITMQ_PASSWORD=rabbit_secret`
- `MAIN_API_PORT=3000`
- `FILES_SERVICE_PORT=3001`
- `AI_TRANSLATOR_PORT=3002`
- `FRONTEND_PORT=80`
- `JWT_ACCESS_TTL=68400`
- `JWT_REFRESH_TTL=604800`
- `FILES_SERVICE_SECRET=files_service_internal_secret`
- `MAIN_API_INTERNAL_SECRET=main_api_internal_secret`
- `EMAIL_BATCH_SIZE=50`
- `EMAIL_BATCH_DELAY_MS=2000`
- `GROQ_MODEL=groq/compound`
- `FRONTEND_URL=http://localhost`
- `CAPTCHA_SECRET=your_captcha_secret` (any random string is fine for local use)

#### Values you **must** change / generate

##### 1. JWT RSA Key Pair (`JWT_ACCESS_PRIVATE_KEY` and `JWT_ACCESS_PUBLIC_KEY`)

You need a real RSA key pair. Generate it with OpenSSL:

**Linux / macOS / WSL / Git Bash:**

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Extract public key
openssl rsa -in private.pem -pubout -out public.pem
```

Now convert the keys into single-line strings with `\n`:

**Linux / macOS:**

```bash
# Private key (copy the whole output)
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private.pem

# Public key
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' public.pem
```

**Windows (PowerShell):**

```powershell
# Private key
(Get-Content private.pem -Raw) -replace "`r`n","\n" -replace "`n","\n"

# Public key
(Get-Content public.pem -Raw) -replace "`r`n","\n" -replace "`n","\n"
```

Paste the resulting strings into `.env`:

```env
JWT_ACCESS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
JWT_ACCESS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----"
```

> Delete `private.pem` and `public.pem` after copying (never commit them).

##### 2. JWT Refresh Secret (`JWT_REFRESH_SECRET`)

Generate a strong random string (at least 32–64 characters):

```bash
# Linux / macOS
openssl rand -base64 48

# Windows (PowerShell)
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Or use any password generator. Put the result into:

```env
JWT_REFRESH_SECRET=your_generated_long_random_string
```

##### 3. Groq API Key (`GROQ_API_KEY`) — required for AI Translator

1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up / log in
3. Create an API key
4. Paste it into `.env`:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

Without a valid key the translator service will not work (the rest of the app still runs).

##### 4. SMTP Credentials (for daily emails)

To enable the email distribution feature you need a real SMTP account.

**Recommended for development — Gmail App Password:**

1. Enable 2-Factor Authentication on your Google account.
2. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for “Mail”.
4. Use these values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx   # the 16-character app password
SMTP_FROM=your.email@gmail.com
SMTP_FROM_NAME=Comments App
```

You can leave the default values if you do not need emails yet — the services will start but sending will fail.

### Step 3 — Build and Start All Services

From the project root:

```bash
docker compose up --build -d
```

This will:

- Pull required images (PostgreSQL 16, Redis 7, RabbitMQ 3.13)
- Build all Node.js services
- Start everything in the background

Wait until all containers are healthy (usually 1–2 minutes on first run).

Check status:

```bash
docker compose ps
```

You should see all services in `running` / `healthy` state.

### Step 4 — Run Database Migrations

Enter the `main-api` container and run migrations:

```bash
docker compose exec main-api npm run migrations-dev
```

### Step 5 — Seed the Database (optional but recommended)

```bash
docker compose exec main-api npm run seeders-dev
```

This populates the database with initial data (users, sample comments, etc.).

### Step 6 — Access the Application

| Service              | URL                                      |
|----------------------|------------------------------------------|
| Frontend             | http://localhost (or http://localhost:80) |
| Main API (GraphQL)   | http://localhost:3000/graphql            |
| Files Service        | http://localhost:3001                    |
| AI Translator        | http://localhost:3002                    |
| RabbitMQ Management  | http://localhost:15672 (user/pass from `.env`) |
| PostgreSQL           | localhost:5433                           |
| Redis                | localhost:6379                           |

Default frontend is served on port 80 via Nginx.

### Step 7 — (Optional) Manual Email Distribution

To trigger the daily stats email job immediately:

```bash
docker compose exec email-distribution npm run run-once
```

### Stopping the Stack

```bash
docker compose down
```

To also remove volumes (database data, uploaded files, etc.):

```bash
docker compose down -v
```

---

## 2. Project Structure

```
CommentsApp/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Template for environment variables
├── .gitignore
├── README.md
│
├── main-api/                   # NestJS GraphQL API (core backend)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── database/           # Sequelize models, migrations, seeders
│       ├── modules/            # Feature modules (auth, users, comments, votes, reports, files, captcha, translate, notifications, stats)
│       ├── graphql/
│       ├── redis/
│       └── shared/             # Filters, interceptors, guards, etc.
│
├── frontend/                   # React + Vite + Tailwind SPA
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── user/               # User-facing pages & features
│       ├── admin/              # Admin pages (reports moderation)
│       └── shared/             # Hooks, stores, UI components
│
├── files-service/              # Express microservice for file uploads & serving
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── config.ts
│       └── routes/
│
├── ai-translator/              # Express microservice using Groq LLM for translation
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── config.ts
│       └── routes/
│
├── email-distribution/         # Cron-based service that prepares daily stats emails
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.ts
│       ├── scheduler.ts
│       ├── batch-processor.ts
│       └── run-once.ts
│
└── smtp-service/               # RabbitMQ consumer that actually sends emails via Nodemailer
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── server.ts
        ├── rabbitmq.ts
        ├── mailer.ts
        ├── config.ts
        └── templates/
```

---

## 3. Docker & Services Overview

The application is fully containerized with Docker Compose. All services communicate over an internal Docker network.

### Infrastructure Services

| Service     | Image                          | Ports (host)     | Responsibility |
|-------------|--------------------------------|------------------|----------------|
| **postgres** | `postgres:16-alpine`          | `5433 → 5432`    | Primary relational database (users, comments, votes, reports, etc.) |
| **redis**    | `redis:7-alpine`              | `6379 → 6379`    | Caching, session/blacklist storage, rate-limiting support |
| **rabbitmq** | `rabbitmq:3.13-management-alpine` | `5672`, `15672` | Message broker for asynchronous email jobs |

### Application Services

| Service                | Technology          | Port | Responsibility |
|------------------------|---------------------|------|----------------|
| **main-api**           | NestJS + GraphQL + Sequelize + Socket.IO | 3000 | Core business logic: auth (JWT), users, comments, votes, reports, captcha, notifications, stats. Proxies file & translation requests. |
| **files-service**      | Express + Multer + Sharp | 3001 | Secure file upload (images + text), image resizing, static file serving. Protected by internal secret. |
| **ai-translator**      | Express + Groq SDK  | 3002 | Translates comment text using Groq LLM (groq/compound). |
| **email-distribution** | Node + node-cron + amqplib | —    | Runs a daily cron job (00:00), fetches user stats from main-api, publishes email jobs to RabbitMQ. |
| **smtp-service**       | Node + Nodemailer + amqplib | —    | Consumes email jobs from RabbitMQ and sends HTML emails via SMTP. |
| **frontend**           | React + Vite + Tailwind → Nginx | 80   | Single-page application served by Nginx. Talks to main-api (REST/GraphQL + WebSocket) and files-service. |

### Key Inter-service Communication

- `main-api` → PostgreSQL, Redis, RabbitMQ
- `main-api` → `files-service` (HTTP, authenticated with `FILES_SERVICE_SECRET`)
- `main-api` → `ai-translator` (HTTP)
- `email-distribution` → `main-api` (HTTP, authenticated with `MAIN_API_INTERNAL_SECRET`)
- `email-distribution` → RabbitMQ (publishes)
- `smtp-service` → RabbitMQ (consumes) → external SMTP server

All Node services mount their source code as volumes and run in watch/dev mode (`start:dev`), so code changes are reflected without rebuilding (except for the frontend production build).

---

## 4. Environment Variables (.env)

See the detailed explanations in the [Getting Started](#1-getting-started-from-zero-to-running) section.

Quick reference of the most important variables:

```env
# Database
POSTGRES_DB=comments_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_secret

# Cache & Broker
REDIS_PASSWORD=redis_secret
RABBITMQ_USER=rabbit
RABBITMQ_PASSWORD=rabbit_secret

# Ports
MAIN_API_PORT=3000
FILES_SERVICE_PORT=3001
AI_TRANSLATOR_PORT=3002
FRONTEND_PORT=80

# JWT (generate yourself)
JWT_ACCESS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_ACCESS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_REFRESH_SECRET=your_long_random_secret
JWT_ACCESS_TTL=68400
JWT_REFRESH_TTL=604800

# Internal secrets (change in production)
FILES_SERVICE_SECRET=files_service_internal_secret
MAIN_API_INTERNAL_SECRET=main_api_internal_secret
CAPTCHA_SECRET=your_captcha_secret

# AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=groq/compound

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your@gmail.com
SMTP_FROM_NAME=Comments App
EMAIL_BATCH_SIZE=50
EMAIL_BATCH_DELAY_MS=2000

# Frontend origin (CORS)
FRONTEND_URL=http://localhost
```

---

## 5. Useful Commands

```bash
# Start everything
docker compose up --build -d

# View logs
docker compose logs -f
docker compose logs -f main-api
docker compose logs -f frontend

# Stop
docker compose down

# Stop + remove volumes (reset DB & files)
docker compose down -v

# Rebuild a single service
docker compose up --build -d main-api

# Run migrations
docker compose exec main-api npm run migrations-dev

# Undo last migration
docker compose exec main-api npm run migrations-dev-undo

# Seed data
docker compose exec main-api npm run seeders-dev

# Stress seed (large dataset)
docker compose exec main-api npm run stress-seed

# Manual email job
docker compose exec email-distribution npm run run-once

# Enter a container shell
docker compose exec main-api sh
```

---

## 6. Architecture Notes

- **Authentication**: JWT (RSA for access tokens + secret for refresh tokens). Refresh tokens are stored in HTTP-only cookies.
- **Real-time**: Socket.IO on `main-api` for live comment/vote updates.
- **File handling**: Images are resized (max 320×240) and stored on a Docker volume. Access is controlled via signed tokens.
- **Rate limiting**: NestJS Throttler (100 requests / minute by default).
- **Email pipeline**: Cron → `email-distribution` → RabbitMQ → `smtp-service` → SMTP.
- **Frontend**: Protected routes for authenticated users and an admin-only reports page.

---

## License

This project is provided as-is for educational and demonstration purposes.
```
