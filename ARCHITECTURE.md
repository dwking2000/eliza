# ElizaOS Architecture Overview

## Client-Server Architecture

ElizaOS uses a client-server architecture with three main components:

1. **Server** (`packages/server`) - Node.js/Bun server providing REST API and agent runtime
2. **Client** (`packages/client`) - React web UI for interacting with agents
3. **App** (`packages/app`) - Tauri desktop/mobile application wrapping the client

### Communication Flow

```
Client/App (React UI)
    ↓ HTTP/REST
API Client (@elizaos/api-client)
    ↓ /api/* endpoints
Server (Express + Agent Runtime)
    ↓
Database (PGLite/PostgreSQL)
```

## API Authentication

### Default: No Authentication Required

By default, ElizaOS runs in an **open/trusted environment** with no authentication:

- All API endpoints are publicly accessible
- No API keys or tokens required
- Suitable for local development or trusted networks

### Optional API Key Authentication

Authentication can be enabled using a simple API key mechanism:

#### Server Configuration

Set the `ELIZA_SERVER_AUTH_TOKEN` environment variable:

```bash
ELIZA_SERVER_AUTH_TOKEN=your-secret-key-here
```

When configured:
- All `/api/*` routes require authentication
- Requests must include `X-API-KEY` header matching the token
- Health check endpoints (`/healthz`, `/health`) remain public

**Implementation:** `packages/server/src/middleware/auth.ts`

```typescript
// If no token configured, authentication is disabled
if (!serverAuthToken) {
  return next(); // All requests pass through
}

// If token is set, validate X-API-KEY header
if (!apiKey || apiKey !== serverAuthToken) {
  return res.status(401).send('Unauthorized');
}
```

#### Client Configuration

The client automatically handles API authentication:

1. **API Key Storage:** Stored in browser `localStorage` with key: `eliza-api-key-${window.location.origin}`
2. **Automatic Prompting:** If server returns 401 Unauthorized, client displays dialog to enter API key
3. **Header Injection:** When API key is configured, client adds `X-API-KEY` header to all requests

**Files:**
- Client config: `packages/client/src/lib/api-client-config.ts`
- UI dialog: `packages/client/src/components/api-key-dialog.tsx`
- Base client: `packages/api-client/src/lib/base-client.ts`

## Deployment Architecture

### Design Philosophy

ElizaOS is a **self-hosted framework**, not a SaaS platform. There is **no subscription/billing code** in the codebase.

### Deployment Options

#### 1. Local Development (Default)

Run client and server together on localhost:

```bash
# Terminal 1: Start server
cd packages/server
bun run dev

# Terminal 2: Start client
cd packages/client
bun run dev

# Or use the Tauri app
cd packages/app
bun run tauri:dev
```

**Configuration:**
- Server: `http://localhost:3000`
- Client: `http://localhost:5173`
- Database: PGLite (embedded, no setup required)

#### 2. Self-Hosted Docker

Deploy using Docker Compose for production:

```bash
# Build and run
docker compose up -d

# Or use bun scripts
bun run docker:build
bun run docker:run
```

**Configuration:**
```yaml
services:
  postgres:
    image: postgres:16

  eliza:
    build: .
    environment:
      - POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/eliza
      - ELIZA_SERVER_AUTH_TOKEN=your-secret-key
      - NODE_ENV=production
```

**Suitable for:**
- VPS hosting (DigitalOcean, Linode, etc.)
- Cloud VMs (AWS EC2, GCP Compute Engine)
- On-premise servers
- Kubernetes clusters

#### 3. ElizaOS Cloud (Optional Managed Service)

Deploy to AWS ECS using the ElizaOS Cloud service:

```bash
# Deploy via CLI
elizaos deploy

# Requires ELIZAOS_API_KEY environment variable
export ELIZAOS_API_KEY=your-elizaos-cloud-key
```

**Infrastructure:**
- **Container Registry:** AWS ECR (Elastic Container Registry)
- **Compute:** AWS ECS on EC2 (t4g.small ARM or t3.small x86)
- **Cost:** ~$15-19/month per container
- **Features:** Auto-scaling, load balancing, managed updates

**Important:** This is an **optional convenience service** - you can deploy ElizaOS anywhere without using ElizaOS Cloud.

**Documentation:** `packages/cli/src/commands/deploy/README.md`

## Multi-Tenancy Support

### Optional PostgreSQL RLS (Row-Level Security)

ElizaOS supports multi-tenant deployments using PostgreSQL's RLS feature:

#### Configuration

```bash
# Enable RLS isolation
ENABLE_RLS_ISOLATION=true

# Set tenant/owner ID
RLS_OWNER_ID=tenant-123

# Must use PostgreSQL (NOT PGLite)
POSTGRES_URL=postgresql://user:password@host:5432/eliza
```

#### How It Works

1. Each tenant gets a unique `RLS_OWNER_ID`
2. PostgreSQL RLS policies automatically filter all queries by owner
3. Data isolation is enforced at the database level
4. Each agent is assigned to an owner
5. Server ID becomes tenant-scoped

**Implementation:** `packages/server/src/index.ts` (lines 380-441)

#### Requirements

- **PostgreSQL only** - Not compatible with PGLite
- **Non-superuser database account** - Superusers bypass RLS policies
- **Separate server instance per tenant** - Each tenant needs their own server with unique `RLS_OWNER_ID`

#### Use Case

Designed for **hosting providers** serving multiple customers:
- Each customer gets their own isolated environment
- Database-level security prevents data leakage
- Single PostgreSQL database can serve multiple tenants
- Simplified infrastructure management

**Note:** This is NOT a full multi-tenant SaaS platform - each tenant still runs a separate server instance.

## Security Considerations

### Default Security Posture

**Default configuration is OPEN:**
- ❌ No API authentication
- ✅ UI enabled in development mode
- ❌ No CORS restrictions (allows all origins)
- ❌ No rate limiting on most endpoints
- ✅ Rate limiting on health checks only

**Suitable for:** Local development, trusted internal networks

### Production Hardening Checklist

For production deployments, implement these security measures:

#### 1. Enable API Authentication

```bash
ELIZA_SERVER_AUTH_TOKEN=generate-a-strong-random-key
```

#### 2. Disable UI (Optional)

```bash
NODE_ENV=production  # Disables UI by default
ELIZA_UI_ENABLE=false  # Explicitly disable UI
```

#### 3. Configure CORS

```bash
CORS_ORIGIN=https://yourdomain.com
```

#### 4. Use PostgreSQL

```bash
POSTGRES_URL=postgresql://user:password@host:5432/eliza
```

Benefits over PGLite:
- Better performance for production workloads
- Proper backup/restore capabilities
- Multi-tenant support via RLS
- External monitoring and management tools

#### 5. Enable Multi-Tenancy (If Applicable)

```bash
ENABLE_RLS_ISOLATION=true
RLS_OWNER_ID=unique-tenant-id
```

#### 6. Reverse Proxy

Deploy behind nginx, Caddy, or Cloudflare for:
- TLS/SSL termination
- Additional rate limiting
- DDoS protection
- Access logging

#### 7. Environment Security

```bash
# Use strong secrets
ELIZA_SERVER_AUTH_TOKEN=$(openssl rand -hex 32)

# Restrict access
SERVER_HOST=127.0.0.1  # Only accept local connections if behind proxy

# Use production mode
NODE_ENV=production
```

## Environment Variables Reference

### Server Configuration

```bash
# Port and host
SERVER_PORT=3000
SERVER_HOST=0.0.0.0

# Authentication (optional)
ELIZA_SERVER_AUTH_TOKEN=

# UI Control
ELIZA_UI_ENABLE=        # Auto: enabled in dev, disabled in prod
NODE_ENV=development    # Affects UI availability

# CORS
CORS_ORIGIN=            # Default: allows all origins
```

### Database Configuration

```bash
# PostgreSQL (recommended for production)
POSTGRES_URL=postgresql://user:password@host:5432/eliza

# PGLite (default, embedded database)
PGLITE_DATA_DIR=./data  # Directory for local database files
```

### Multi-Tenancy Configuration

```bash
# Enable Row-Level Security isolation
ENABLE_RLS_ISOLATION=false

# Tenant/Owner ID (required when RLS enabled)
RLS_OWNER_ID=
```

### Model Provider API Keys

At least one is required:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_STUDIO_API_KEY=
GROQ_API_KEY=
```

### External Services (Optional)

```bash
# Discord
DISCORD_APPLICATION_ID=
DISCORD_API_TOKEN=

# Telegram
TELEGRAM_BOT_TOKEN=

# Twitter
TWITTER_TARGET_USERS=
TWITTER_DRY_RUN=false

# Blockchain
EVM_PRIVATE_KEY=
SOLANA_PRIVATE_KEY=
```

## Architecture Patterns

### Component Structure

```
┌─────────────────────────────────────────────┐
│  Client UI (React)                          │
│  - Chat interface                           │
│  - Agent management                         │
│  - Settings/configuration                   │
└─────────────┬───────────────────────────────┘
              │ HTTP/REST API
              ↓
┌─────────────────────────────────────────────┐
│  API Client (@elizaos/api-client)           │
│  - Type-safe API wrapper                    │
│  - Automatic authentication                 │
│  - Error handling                           │
└─────────────┬───────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────┐
│  Server (Express)                           │
│  ┌─────────────────────────────────────┐   │
│  │  API Routes (/api/*)                │   │
│  │  - Authentication middleware        │   │
│  │  - Agents, messages, memories       │   │
│  └─────────────┬───────────────────────┘   │
│                ↓                            │
│  ┌─────────────────────────────────────┐   │
│  │  Agent Runtime (@elizaos/core)      │   │
│  │  - Actions, providers, evaluators   │   │
│  │  - Plugin system                    │   │
│  │  - Memory management                │   │
│  └─────────────┬───────────────────────┘   │
└────────────────┼───────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Database                                   │
│  - PGLite (development)                     │
│  - PostgreSQL (production)                  │
│  - Optional RLS for multi-tenancy           │
└─────────────────────────────────────────────┘
```

### Key Abstractions

- **Agent:** AI agent with personality, knowledge, and capabilities
- **Action:** Executable capability (e.g., search, send message)
- **Provider:** Context supplier for agent decisions (read-only)
- **Evaluator:** Post-interaction learning and reflection
- **Service:** Stateful external integration (e.g., Discord, Twitter)
- **Plugin:** Modular extension providing actions, providers, evaluators, and services

**Reference:** `CLAUDE.md` for detailed component architecture

## Summary

### Key Characteristics

1. **No Built-in User Authentication** - Simple API key protection only
2. **Not a SaaS Platform** - Framework for building AI agents, not a service
3. **Self-Hosted First** - Designed to run on your own infrastructure
4. **Optional Authentication** - Disabled by default, enable for production
5. **Optional Multi-Tenancy** - PostgreSQL RLS for hosting providers
6. **Flexible Deployment** - Local, Docker, cloud VMs, or ElizaOS Cloud
7. **Security by Configuration** - Defaults are open, harden for production

### Intended Use Cases

✅ **Great for:**
- Developers building custom AI agents
- Self-hosted agent deployments
- Internal tools and automation
- Development and experimentation
- Hosting provider offering agent services

❌ **Not designed for:**
- Multi-tenant SaaS out-of-the-box
- Public-facing production without hardening
- Subscription-based business model
- Complex user management and billing

---

**Last Updated:** 2025-11-16
**Version:** Based on ElizaOS v1.6.5-alpha.5
