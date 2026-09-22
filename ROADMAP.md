# Step-by-Step Distributed Systems Mastery Roadmap

This roadmap documents the complete plan, architectural principles, and learning milestones for the **Distributed Systems Monorepo**.

---

## 🧭 The Learning Philosophy: "No-Magic-Code"
Every single module follows a **4-Step Mastery Cycle**:
1. **The System Design Problem**: Understand why naive code fails in production (race conditions, memory exhaustion, network partitions, dual writes).
2. **The Architecture Blueprint**: Map out components, data flow, and trade-offs.
3. **Line-by-Line Implementation**: Write clean, modular, strictly typed code with thorough inline explanations.
4. **The "Break It" Benchmark**: Simulate traffic surges (5,000–50,000 requests) with k6, kill dependencies, and verify resilience.

---

## 🚀 Module 1: Distributed API Gateway & Rate Limiter (Traffic & Edge Layer)
* **Goal**: Build a high-throughput API gateway that authenticates, load balances, and rate limits incoming traffic across distributed instances without race conditions.
* **Key Topics**:
  - Token Bucket vs. Leaky Bucket vs. Sliding Window algorithms.
  - Why `redis.get()` + `redis.set()` creates race conditions under concurrency.
  - Atomicity in Redis using Lua scripts.
  - Circuit Breakers & In-memory (LRU) fallback when Redis is degraded.
  - Benchmarking with k6 to measure latency at p95 and p99.
* **DevOps Milestone**:
  - Multi-stage Docker container.
  - Kubernetes Deployment + Service + Horizontal Pod Autoscaler (HPA).

---

## 📦 Module 2: Scalable Distributed Media & File Pipeline (Storage & Async Compute)
* **Goal**: Handle uploads and processing of large binaries (images, PDFs, videos) without loading files into server RAM or paying heavy cloud egress bills.
* **Key Topics**:
  - Direct-to-storage uploads using Presigned URLs (MinIO / S3).
  - Asynchronous background job processing with Redis & BullMQ.
  - CPU-bound worker fleet (Sharp / FFmpeg / PDF processing).
  - Cost Optimization via Content-Addressable Storage (SHA-256 deduplication).
  - Storage lifecycle management (Hot vs. Cold storage tiers).
* **DevOps Milestone**:
  - Self-hosted MinIO in Docker.
  - KEDA (Kubernetes Event-driven Autoscaling) to scale worker pods from 1 to 10 based on Redis queue depth.

---

## 🔄 Module 3: Resilient Saga Microservices Engine (Distributed Transactions)
* **Goal**: Coordinate multi-service transactions (Order, Payment, Inventory) across independent databases without distributed locks (2PC).
* **Key Topics**:
  - Dual-write problem: Database commit vs. Kafka message publish.
  - Implementing the Transactional Outbox Pattern with PostgreSQL.
  - Saga Orchestrator / Choreography with Compensating Transactions on failure.
  - Idempotency keys to guarantee exact-once processing under retries.
* **DevOps Milestone**:
  - Kafka / Redpanda broker deployment.
  - Full microservices orchestration in Docker Compose and Kubernetes.

---

## 📊 Module 4: Observability, CI/CD & Production Hardening
* **Production Standards Applied Across All Services**:
  - Structured JSON logging with Correlation IDs (`x-request-id`).
  - Kubernetes `/healthz` (liveness) and `/readyz` (readiness) probes.
  - Graceful shutdown handling (`SIGTERM` / `SIGINT`).
  - GitHub Actions CI pipeline running linting, type-checks, unit tests, and Docker builds.
  - Prometheus metrics exporter + Grafana dashboard monitoring latency, throughput, and error rates.
