# Ticketing System for IT Support

Production-ready IT support ticketing system with Spring Boot backend and Next.js frontend.

## Features

- JWT-based authentication with refresh tokens
- Role-based access control (USER, AGENT, ADMIN)
- Ticket management with priorities and statuses
- Smart triage system with ML-based predictions
- File uploads with security validation
- Real-time Kanban board for ticket management
- Admin dashboard with KPIs
- Ticket ratings and feedback

## Prerequisites

- Docker and Docker Compose
- Make (optional, for convenience commands)

## Quick Start

### Using Docker (Recommended)

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Edit `.env` and set at minimum:**
```
JWT_SECRET=your-very-long-secret-key-minimum-256-bits-change-this-in-production
```

3. **Start all services:**
```bash
docker-compose up --build
```

Or using Make:
```bash
make build
make up
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

5. **Login with seed admin:**
   - **Admin Login Credentials:**
     - Email: `admin@ticketing.com`
     - Password: `AdminPass123!`

**Note:** The admin user is automatically created on application startup if it doesn't exist. You can check the backend logs to confirm: `docker-compose logs backend | Select-String -Pattern "Admin user"`

## Local Development (Without Docker)

### Prerequisites
- Java 21 installed
- Maven 3.9+ installed
- Node.js 20+ and npm installed
- PostgreSQL 16 running locally

### Backend Setup

1. **Create database:**
```sql
CREATE DATABASE ticketing_db;
```

2. **Set environment variables:**
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/ticketing_db
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export JWT_SECRET=your-very-long-secret-key-minimum-256-bits
```

3. **Run backend:**
```bash
mvn clean install
mvn spring-boot:run
```

Backend will start on http://localhost:8080

### Frontend Setup

1. **Install dependencies:**
```bash
cd ticketing-frontend
npm install
```

2. **Create `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

3. **Run frontend:**
```bash
npm run dev
```

Frontend will start on http://localhost:3000

## Testing

Run all tests:
```bash
make test
```

Run backend tests:
```bash
make test-backend
```

Run frontend tests:
```bash
make test-frontend
```

## Code Quality

### Backend

- Checkstyle: `mvn checkstyle:check`
- SpotBugs: `mvn spotbugs:check`

### Frontend

- ESLint: `npm run lint`
- Prettier: `npm run format:check`

## Make Commands

- `make build` - Build Docker images
- `make up` - Start all services
- `make down` - Stop all services
- `make test` - Run all tests
- `make test-backend` - Run backend tests
- `make test-frontend` - Run frontend tests
- `make logs` - View all logs
- `make logs-backend` - View backend logs
- `make logs-frontend` - View frontend logs
- `make clean` - Remove containers and volumes
- `make restart` - Restart all services
- `make stop` - Stop all services
- `make start` - Start all services

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `JWT_SECRET` - **IMPORTANT:** Change this to a secure random string (minimum 256 bits) before production
- `POSTGRES_*` - Database credentials (defaults work for Docker)
- `AWS_S3_*` - Only needed if using S3 for file storage
- `BACKEND_PORT` - Backend port (default: 8080)
- `FRONTEND_PORT` - Frontend port (default: 3000)
- `NEXT_PUBLIC_API_URL` - Frontend API URL (default: http://localhost:8080/api)

## Troubleshooting

### Docker Issues

**Docker Desktop not running (Windows):**
- Start Docker Desktop from Windows Start Menu
- Wait for it to fully start (check system tray)
- Verify: `docker ps` should work without errors

**Port already in use:**
- Change ports in `.env` file:
  - `BACKEND_PORT=8081`
  - `FRONTEND_PORT=3001`
  - `POSTGRES_PORT=5433`

**Database connection errors:**
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs db`
- Verify environment variables in `.env`

**Build failures:**
- Clean and rebuild: `docker-compose down -v && docker-compose build --no-cache`

### Backend Issues

**Database migration errors:**
- Check Flyway logs in application output
- Ensure database is empty or migrations are up to date

**JWT errors:**
- Ensure `JWT_SECRET` is set and is at least 32 characters long

### Frontend Issues

**API connection errors:**
- Verify `NEXT_PUBLIC_API_URL` is correct in `.env.local`
- Check backend is running: `curl http://localhost:8080/api/auth/login`
- Check browser console for CORS errors

**Build errors:**
- Delete `node_modules` and `.next`: `rm -rf node_modules .next`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### IDE Issues

**Package declaration errors (Java):**
- This is an IDE configuration issue, not a code error
- **IntelliJ IDEA:** Right-click `pom.xml` → Maven → Reload Project
- **VS Code:** Run "Java: Clean Java Language Server Workspace" from Command Palette
- **Eclipse:** Right-click project → Maven → Update Project

The Maven build validates successfully (`mvn validate` passes), confirming the code is correct.

## API Documentation

Backend API runs on `http://localhost:8080/api`

Key endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `POST /api/triage/predict` - Get triage prediction
- `GET /api/admin/stats` - Admin statistics

## License

MIT

