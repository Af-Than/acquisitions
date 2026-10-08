# Acquisitions API

Acquisitions is an Express.js authentication microservice backed by Neon Serverless PostgreSQL and Drizzle ORM. It provides JWT-based signup and signin flows, secure HTTP-only cookies, request logging, validation, security headers, bot detection, and rate limiting.

## Features

- Express 5 REST API
- Neon Serverless PostgreSQL with Drizzle ORM
- JWT authentication stored in an HTTP-only cookie
- Zod request validation
- bcrypt password hashing
- Helmet, CORS, Morgan, Winston, and Arcjet security middleware
- Development and production Docker Compose configurations
- Docker Hub publishing through GitHub Actions

## Requirements

- Node.js 22 or newer
- npm
- Docker Desktop, for container workflows
- A Neon PostgreSQL database
- An Arcjet key, for protection and rate limiting

## Installation

```bash
npm install
```

Create a `.env` file in the project root. Do not commit it.

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
ARCJET_KEY=your-arcjet-key
ARCJET_ENV=development
```

Start the API in watch mode:

```bash
npm run dev
```

Start it without watch mode:

```bash
npm start
```

The API runs at `http://localhost:3001` by default.

## API Endpoints

### Health check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "message": "acquisitions microservice is healthy",
  "timestamp": "2026-10-08T00:00:00.000Z"
}
```

### API check

```http
GET /api
```

### Sign up

```http
POST /api/auth/signup
Content-Type: application/json
```

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "user"
}
```

`role` accepts `user` or `admin` and defaults to `user`. A successful request returns `201` and sets the `auth_token` cookie.

### Sign in

```http
POST /api/auth/signin
Content-Type: application/json
```

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

A successful request returns `200` and sets the `auth_token` cookie.

### Sign out

```http
POST /api/auth/signout
```

The `auth_token` cookie is cleared and the endpoint returns `204`.

## Rate Limiting

Arcjet protects every request. Unauthenticated requests are treated as `guest` requests and are limited to 2 requests per 2 seconds. The configured role limits are:

| Role | Limit |
| --- | ---: |
| Guest | 2 requests / 2 seconds |
| User | 5 requests / 2 seconds |
| Admin | 10 requests / 2 seconds |

When the limit is exceeded, the API returns `429 Too Many Requests`.

## Database Migrations

Generate a migration after changing the schema:

```bash
npm run db:generate
```

Apply migrations to the configured database:

```bash
npm run db:migrate
```

Other Drizzle commands:

```bash
npm run db:push
npm run db:studio
```

## Docker

Build the production image:

```bash
docker build --target production -t acquisitions:latest .
```

Run the production image using local environment variables:

```bash
docker run --name acquisitions \
  --env-file .env \
  -p 3001:3001 \
  acquisitions:latest
```

Run the development stack with Neon Local:

```bash
npm run docker:dev
```

Stop the development stack:

```bash
npm run docker:dev:down
```

Run the production Compose stack:

```bash
npm run docker:prod
```

Stop the production stack:

```bash
npm run docker:prod:down
```

The production container listens on port `3001` and includes a Docker health check for `/health`.

## Docker Hub Publishing

The image is published as `afthan/acquisitions` by the GitHub Actions workflow at `.github/workflows/docker-publish.yml`.

Add these repository secrets in GitHub under **Settings > Secrets and variables > Actions**:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

The workflow runs on pushes to `main` or `master`, and can also be started manually. It publishes both the `latest` tag and a commit-SHA tag.

To publish manually from a local machine:

```bash
docker login
docker build --target production -t afthan/acquisitions:latest .
docker push afthan/acquisitions:latest
```

## Traffic Testing

The repository includes a traffic simulator for checking rate limiting:

```bash
npm run test:traffic
npm run test:traffic:burst
```

The burst test sends rapid requests and should produce `429` responses after the configured guest limit is reached.

## Project Structure

```text
src/
  app.js                  Express application and routes
  index.js                Server entrypoint
  config/                 Database, logger, and Arcjet configuration
  controllers/            Authentication request handlers
  middleware/             Security middleware
  models/                 Drizzle database models
  routes/                 Express routes
  utils/                  Cookies, JWT, and formatting helpers
  validations/            Zod request schemas
drizzle/                  SQL migrations and schema snapshots
Dockerfile                Development and production image stages
docker-compose.dev.yml    Neon Local development stack
docker-compose.prod.yml   Production stack
```

## Validation

Run the linter before committing:

```bash
npm run lint
```

Keep database credentials, JWT secrets, Arcjet keys, and Docker Hub tokens in environment variables or GitHub Actions secrets. Never commit them to the repository.