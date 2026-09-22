# Step-by-Step Distributed Systems Roadmap

This roadmap adapts our 3 core projects to the **enterprise monorepo structure and conventions** (pnpm workspaces, Turborepo, shared packages, Postman collections, and security documentation).

---

## 🧭 The "No-Magic-Code" Learning Philosophy
Each phase follows a strict 4-step cycle:
1. **The System Design Problem**: Understand the production failure mode (race conditions, memory exhaustion, dual-write bug, cascade failures).
2. **The Architecture Blueprint**: Design the data flow, protocols, and interfaces.
3. **Line-by-Line Implementation**: Write clean, strictly-typed code with clear explanatory comments.
4. **The "Break It" Benchmark**: Stress test with k6 (up to 50k RPS), inject chaos (kill Redis/workers), and measure p95/p99 latency.

---

## 🛠️ Phase 0: Monorepo Foundation & Shared Kits (Following Friend's Blueprint)

* [ ] **0.1 Monorepo Root Configuration**
  * `package.json` with `packageManager: pnpm@...` and `only-allow pnpm` preinstall hook.
  * `pnpm-workspace.yaml` defining `apps/*` and `packages/*`.
  * `turbo.json` with build, test, lint, and dev pipeline definitions.
  * `tsconfig.base.json` with strict type checking.
* [ ] **0.2 Shared Packages (`packages/`)**
  * `packages/shared-config`: Base TypeScript and lint configurations.
  * `packages/shared-types`: Standard API error and response wrappers.
  * `packages/validation-kit`: Shared Zod validation schemas.
  * `packages/logger`: Structured JSON logger injecting `correlationId` / `requestId`.
  * `packages/redis-kit`: Reusable Redis connection manager and Lua script loader.
* [ ] **0.3 Production Documentation (`docs/`)**
  * `docs/security/do-dont.md`: Zero hardcoded secrets, input sanitization rules, PII masking.
  * `docs/conventions/api-conventions.md`: Uniform HTTP error schema and status codes.

---

## 🚀 Phase 1: Distributed API Gateway & Rate Limiter (`apps/api-gateway`)

* [ ] **1.1 Architectural Foundations**
  * Why an API Gateway is necessary in front of microservices.
  * The math behind Token Bucket, Leaky Bucket, and Sliding Window Counter.
  * Why standard `GET` + `SET` causes race conditions under concurrency.
* [ ] **1.2 Atomic Rate Limiting with Redis & Lua**
  * Writing the atomic Lua script for Sliding Window Counter.
  * Fast middleware executing the Lua script in <1.5ms.
  * Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
* [ ] **1.3 Fault Tolerance & Edge Proxying**
  * Circuit breaker with in-memory (LRU) fallback when Redis fails or times out.
  * Reverse proxy routing incoming requests to downstream services.
  * JWT verification and request header enrichment (`X-User-Id`, `X-Request-Id`).
* [ ] **1.4 DevOps & Load Testing**
  * Multi-stage Dockerfile.
  * NGINX reverse proxy load balancing across multiple Gateway replicas.
  * Kubernetes manifests + Horizontal Pod Autoscaler (HPA) scaling on CPU/traffic.
  * k6 stress test script simulating 50,000 requests to measure p95/p99 latency.
* [ ] **1.5 Postman Collection & CI**
  * `postman/collections/api-gateway.postman_collection.json` with success and 429 Too Many Requests scenarios.

---

## 📦 Phase 2: Scalable Media & File Processing Pipeline (`apps/media-service`)

* [ ] **2.1 Zero-Bandwidth Direct Uploads (Presigned URLs)**
  * Why uploading files directly to app servers breaks memory and inflates bandwidth costs.
  * Generating short-lived cryptographic Presigned PUT URLs for MinIO / S3.
  * Client uploads directly to object storage; API only tracks metadata.
* [ ] **2.2 Distributed Async Worker Fleet**
  * BullMQ + Redis job queue for media tasks.
  * Worker service processing image resizing (Sharp), thumbnails, and format conversion.
  * Graceful shutdown: waiting for active jobs to finish before pod termination.
* [ ] **2.3 Cost Optimization: Content-Addressable Storage (Deduplication)**
  * Calculating file `SHA-256` hash before finalizing upload.
  * If file hash already exists in storage, link to the existing asset instead of storing duplicate bytes (saves 40–70% storage).
  * Storage lifecycle tiering policy (hot vs cold storage).
* [ ] **2.4 Kubernetes KEDA Queue Autoscaling**
  * Deploying MinIO and Redis in Docker.
  * Configuring Kubernetes KEDA to scale worker pods dynamically from 1 to 10 based on Redis queue depth.
* [ ] **2.5 Postman Collection**
  * `postman/collections/media-service.postman_collection.json`.

---

## 🔄 Phase 3: Resilient Saga Microservices Engine (`apps/transaction-engine`)

* [ ] **3.1 The Distributed Transaction Problem**
  * Why standard database transactions cannot span multiple microservices.
  * The dual-write failure mode (DB commits, but Kafka message fails).
* [ ] **3.2 Transactional Outbox Pattern**
  * Writing state changes and outbound domain events in a single PostgreSQL ACID transaction.
  * Reliable background CDC / Outbox publisher relaying events to Kafka/RabbitMQ.
* [ ] **3.3 Saga Orchestrator & Compensating Rollbacks**
  * Order, Payment, and Inventory state machine.
  * Triggering automatic compensating transactions (refunds/restocking) when any step fails.
  * Idempotency keys ensuring safe retries without duplicate charges.
* [ ] **3.4 DevOps & Observability**
  * Kafka / Redpanda broker configuration.
  * Prometheus metrics exporter + Grafana dashboard tracking transaction success vs rollback rates.
* [ ] **3.5 Postman Collection**
  * `postman/collections/transaction-engine.postman_collection.json`.

---

## 🏁 Phase 4: Unified Platform & Resume Polishing

* [ ] Root `docker-compose.yml` spinning up the entire distributed ecosystem with one command.
* [ ] GitHub Actions CI pipeline running linting, TypeScript type-checks, unit tests, and Newman Postman runs on pull requests.
* [ ] Final resume bullet points, architecture diagrams, and benchmark performance metrics.
