# DevOps Guide: Dockerizing Acquisitions API with Neon Database & Traffic Testing

This guide details the Docker architecture and environment isolation strategies for the **Acquisitions Microservice** using **Neon Serverless PostgreSQL**.

---

## 1. Architectural Overview

| Environment | Database Mechanism | Connection Type | Compose File | Env Config |
| :--- | :--- | :--- | :--- | :--- |
| **Development (Local)** | **Neon Local Proxy** (`neondatabase/neon_local:latest`) | Proxied TCP/HTTP via Docker bridge | `docker-compose.dev.yml` | `.env.development` |
| **Production (Cloud)** | **Neon Cloud Serverless** | Direct HTTPS / Pooled Connection | `docker-compose.prod.yml` | `.env.production` |

```
[Development Flow]
App Container (acquisitions-app-dev)
       |
       v (internal bridge network: app-network)
Neon Local Proxy (acquisitions-neon-local:5432)
       |
       v (ephemeral branch automatically created via Neon API)
Neon Cloud Project (lucky-lab-98149058)

[Production Flow]
App Container (acquisitions-app-prod)
       |
       v (direct SSL connection over internet)
Neon Cloud Database (ep-still-block-...pooler.c-6.us-east-2.aws.neon.tech)
```

---

## 2. Environment Variables Switching Strategy

The application handles switching between local development and production dynamically in `src/config/database.js`:

```javascript
import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configure proxy routing when using Neon Local in development
if (process.env.NEON_LOCAL === 'true' || process.env.NEON_LOCAL_ENDPOINT) {
  neonConfig.fetchEndpoint = process.env.NEON_LOCAL_ENDPOINT || 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
```

### Development (`.env.development`)
```env
NODE_ENV=development
PORT=3001
NEON_LOCAL=true
NEON_LOCAL_ENDPOINT=http://neon-local:5432/sql
DATABASE_URL=postgresql://neon:npg@neon-local:5432/neondb

# Neon Local proxy credentials for ephemeral branching
NEON_API_KEY=<your_neon_api_key>
NEON_PROJECT_ID=lucky-lab-98149058
PARENT_BRANCH_ID=production
```

### Production (`.env.production`)
```env
NODE_ENV=production
PORT=3001
NEON_LOCAL=false
# Direct Neon Cloud connection string (pooled)
DATABASE_URL=postgresql://neondb_owner:npg_UQ1TlhWP5mCD@ep-still-block-b49sy2va-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 3. How to Start the App Locally (Development)

### Prerequisites
- Docker & Docker Compose installed.
- Neon Cloud API Key (obtain from [console.neon.tech](https://console.neon.tech) -> Account -> API Keys).

### Step 1: Set Your Neon API Key
Edit `.env.development` and insert your Neon API key:
```env
NEON_API_KEY=your_actual_neon_api_key
```

### Step 2: Spin Up Development Containers
Run either with npm or docker compose:
```bash
npm run docker:dev
# OR
docker compose -f docker-compose.dev.yml --env-file .env.development up --build
```

**What Happens:**
1. Docker pulls `neondatabase/neon_local:latest`.
2. Neon Local contacts Neon Cloud using your `NEON_API_KEY` and creates an **ephemeral database branch** branched from `PARENT_BRANCH_ID` (`production`).
3. Neon Local listens on internal port `5432`.
4. Your application starts in watch mode (`npm run dev`) with hot reloading mounted to `./src`.
5. When you stop the containers (`Ctrl+C` or `docker compose -f docker-compose.dev.yml down`), Neon Local automatically deletes the ephemeral branch, keeping your cloud project clean!

---

## 4. How to Deploy to Production

In production, **no local proxy container is deployed**. The app runs in a secured, non-root Alpine container directly communicating with the Neon Cloud database over TLS.

### Step 1: Configure Production Secrets
Ensure `.env.production` has your production secrets:
```bash
cp .env.production /etc/acquisitions/.env.production
```

### Step 2: Launch Production Service
```bash
npm run docker:prod
# OR
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Step 3: Verify Health
```bash
curl http://localhost:3001/health
```
Response:
```json
{"status":"ok","message":"acquisitions microservice is healthy","timestamp":"..."}
```

---

## 5. Web Traffic & Security Testing (`web_traffic_simulator`)

The repository includes `web_traffic_simulator` (installed and configured) to run traffic testing against your microservice.

### Key Capabilities Tested:
- **IP Rotation**: Sends requests simulating random public IP addresses via `X-Forwarded-For`.
- **User-Agent Rotation**: Cycles authentic browser strings (Chrome, Firefox, Safari, Mobile).
- **Human Delays**: Randomized inter-request delays.
- **Arcjet Security & Rate Limiting**: Validates behavior against the guest limit (2 requests / 2 seconds).

### Running Traffic Tests:

1. **Standard Traffic Simulation (10 visits)**:
   ```bash
   npm run test:traffic
   ```

2. **Burst Load & Rate-Limit Stress Test (20 rapid requests)**:
   ```bash
   npm run test:traffic:burst
   ```

3. **Running the Original Web Traffic Simulator Script**:
   ```bash
   cd web_traffic_simulator
   python main.py
   ```
