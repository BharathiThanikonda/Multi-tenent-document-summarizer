# Multi-Tenant Document Summarizer

A SaaS platform enabling businesses to upload documents and receive AI-powered summaries with complete tenant isolation, role-based access control, and subscription billing.

## Features

- 🏢 **Multi-Tenancy**: Isolated company workspaces with tenant-based data segregation
- 🔐 **Authentication**: OAuth2 login (Google, Microsoft) with JWT tokens
- 👥 **User Roles**: Admin (manages users & billing), Member (uploads & views summaries)
- 📄 **Document Processing**: PDF upload and AI-based summarization
- 🚀 **Deployment**: Docker containers (Compose)

## Tech Stack

- **Backend**: FastAPI + PostgreSQL (with pgvector support)
- **Frontend**: Next.js (React) with TypeScript
- **Authentication**: OAuth2 + JWT
- **Billing**: Stripe API
- **AI**: OpenAI API for document summarization
- **Deployment**: Docker + Docker Compose

## Project Structure

```
.
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core configuration
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── main.py      # Application entry point
│   ├── alembic/         # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities
│   │   └── services/   # API clients
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml  # Docker Compose
└── backend/prod_env/   # Production env example
```

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Multi-Tenant-Document-Summarizer
   ```

2. **Set up environment variables**

   ```bash
   # Backend env (local)
   cp backend/.env.template backend/.env
   # Frontend env (local)
   cp frontend/.env.local.template frontend/.env.local
   ```

3. **Start services with Docker Compose**

   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Backend Setup (Standalone)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend Setup (Standalone)

```bash
cd frontend
npm install
npm run dev
```

## Configuration

### Environment Variables

See the env templates for all required variables:

- **Database**: `DATABASE_URL`
- **OAuth**: `GOOGLE_CLIENT_ID`, `MICROSOFT_CLIENT_ID`, etc.
- **JWT**: `SECRET_KEY`, `ALGORITHM`
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **AI**: `GEMINI_API_KEY` (used by the backend)

## Deployment

### Docker (Local)

```bash
docker compose up -d
```

### Docker (Production via Docker Hub)

1) Build and push images (local)

```bash
docker build -t <dockerhub-user>/mtds-backend:latest backend
docker build -t <dockerhub-user>/mtds-frontend:latest frontend
docker push <dockerhub-user>/mtds-backend:latest
docker push <dockerhub-user>/mtds-frontend:latest
```

2) On the server, set env files:
- backend/prod_env/.env
- frontend/.env.local1

3) Update docker-compose.yml to use images and prod env files, then:

```bash
docker compose pull
docker compose up -d
docker compose exec backend alembic upgrade head
```

## API Documentation

Interactive API documentation available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

## Multi-Tenancy Architecture

The platform uses a **shared database with tenant_id isolation** approach:

- All data tables include a `tenant_id` (organization_id) foreign key
- Tenant context middleware automatically filters queries
- Row-level security ensures data isolation
- Each organization has separate billing and user management

## Security

- OAuth2 authentication with major providers
- JWT-based API authentication
- Role-based access control (RBAC)
- Tenant isolation at database and application levels
- Secure credential management via Kubernetes secrets
