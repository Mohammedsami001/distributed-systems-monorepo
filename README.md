# Distributed Systems & Cloud Platform Monorepo

Enterprise-grade monorepo demonstrating high-throughput backend systems, distributed transaction consistency, asynchronous media streaming, and cloud-native DevOps.

Architected using **pnpm workspaces**, **Turborepo**, **Docker**, and **Kubernetes**.

---

## 1. Monorepo Architecture & Naming Conventions

Every service and package follows strict enterprise naming and colocation rules:
* **Services (`apps/`)**: Named strictly by purpose (`api-gateway`, `media-service`, `transaction-engine`).
* **Shared Libraries (`packages/`)**: Standalone, internal packages shared across services with no business logic leakage. Exported via pnpm `workspace:*`.
* **DevOps (`deploy/`)**: Docker Compose, Kubernetes manifests, HPA, and KEDA configurations.
* **Documentation (`docs/`)**: Architecture RFCs, conventions, and security policies (`docs/security/do-dont.md`).
* **API Testing (`postman/`)**: Production-ready Postman collections and environments run via Newman in CI.

---

## 2. Directory Structure

```text
distributed-systems-monorepo/
├── apps/
│   ├── api-gateway/            # Project 1: Edge Proxy & Distributed Rate Limiter
│   ├── media-service/          # Project 2: Direct-to-Storage Ingestion & Worker Fleet
│   └── transaction-engine/     # Project 3: Distributed Saga & Outbox Orchestrator
│
├── packages/
│   ├── shared-config/          # Shared ESLint, Prettier, and base tsconfig.base.json
│   ├── shared-types/           # Cross-service TypeScript interfaces & domain entities
│   ├── validation-kit/         # Zod schemas shared across API DTOs and workers
│   ├── logger/                 # Production JSON logger with Request/Trace ID correlation
│   └── redis-kit/              # Reusable Redis connection pool, Lua scripts & distributed locks
│
├── deploy/
│   ├── docker/                 # Multi-service docker-compose for local development
│   ├── k8s/                    # Kubernetes Deployments, Services, HPA, and KEDA configurations
│   └── observability/          # Prometheus scraping configs and Grafana dashboards
│
├── tests/
│   └── benchmarks/             # k6 scripts for 50,000+ RPS stress and load testing
│
├── docs/
│   ├── architecture/           # System design specifications and service boundaries
│   ├── security/
│   │   └── do-dont.md          # Security standards, input sanitization, and PII masking
│   └── conventions/
│       ├── api-conventions.md  # HTTP status codes, error schemas, and gRPC rules
│       └── git-conventions.md  # Conventional commits and PR standards
│
├── postman/
│   ├── environments/           # local.postman_environment.json, staging, prod
│   └── collections/            # 1:1 collections per service for automated testing
│
├── package.json                # Root config with pnpm enforcement & Turborepo scripts
├── pnpm-workspace.yaml         # pnpm workspace definition
├── turbo.json                  # Turborepo task pipeline (build, test, lint, dev)
├── tsconfig.base.json          # Strict shared TypeScript configuration
└── ROADMAP.md                  # Comprehensive learning syllabus and implementation plan
```

---

## 3. The 3 Core Projects

### 🔹 Project 1: Distributed API Gateway & Rate Limiter (`apps/api-gateway`)
* **Focus**: Edge traffic, millions of requests, low latency, caching.
* **Tech**: Node.js/Fastify or Go, Redis Cluster, Lua scripts, NGINX.
* **Key Features**:
  * Token Bucket & Sliding Window Counter rate limiting via atomic Redis Lua scripts (race-condition free).
  * In-memory LRU cache fallback & circuit breaker when Redis latency spikes.
  * Reverse proxy and JWT authentication.
  * Load balanced via NGINX with Kubernetes Horizontal Pod Autoscaler (HPA).

### 🔹 Project 2: Scalable Distributed Media & File Pipeline (`apps/media-service`)
* **Focus**: Big data, binary handling, async compute, cost optimization.
* **Tech**: S3/MinIO, BullMQ, Redis, Sharp/FFmpeg.
* **Key Features**:
  * Zero-bandwidth server uploads: Direct-to-storage uploads via short-lived Presigned URLs.
  * Asynchronous background worker fleet for resizing, format conversion, and thumbnail generation.
  * Cost Optimization: Content-Addressable Storage deduplication via SHA-256 hash (never store duplicate media).
  * Autoscaling via Kubernetes KEDA scaling workers dynamically based on Redis queue depth.

### 🔹 Project 3: Resilient Microservices Transaction Engine (`apps/transaction-engine`)
* **Focus**: Distributed systems, microservice consistency, fault tolerance.
* **Tech**: Kafka / RabbitMQ, PostgreSQL, gRPC.
* **Key Features**:
  * Saga Pattern (Orchestrator/Choreography) coordinating Order, Payment, and Inventory services.
  * Transactional Outbox Pattern to solve the dual-write problem (guaranteeing zero message loss).
  * Automated compensating transactions (rollbacks) upon downstream microservice failure.
  * Idempotency keys ensuring exact-once execution under network retries.

---

## 4. Package Manager & Dependency Standards

* **pnpm Only**: Enforced via `only-allow pnpm` preinstall hook and `packageManager` field in `package.json`.
* **Internal Linking**: All packages inside `packages/` are linked using the `workspace:*` protocol.
* **Production Standards**:
  * Every API endpoint validates inputs using Zod DTO schemas (`packages/validation-kit`).
  * All logs are structured JSON containing correlation IDs (`x-request-id`) (`packages/logger`).
  * Kubernetes `/healthz` (liveness) and `/readyz` (readiness) probes implemented on all services.
  * Graceful shutdown handlers intercepting `SIGTERM` and `SIGINT` signals.
