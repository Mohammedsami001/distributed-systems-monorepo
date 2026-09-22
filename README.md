# Distributed Systems, High-Scale Backend & DevOps Monorepo

Welcome to the **Distributed Systems & Cloud Platform Monorepo**. This project is specifically engineered to demonstrate production-grade distributed systems, horizontal scaling, cloud-native DevOps, and cost/latency optimization for high-scale backend engineering roles.

---

## 🏗️ The 3 Core Projects in This Monorepo

```
                                [ Incoming Client Traffic ]
                                             │
                                             ▼
             ┌───────────────────────────────────────────────────────────────┐
             │       PROJECT 1: Distributed API Gateway & Rate Limiter       │
             │           (Edge Traffic, NGINX, Redis Lua, Caching)           │
             └───────────────────────────────┬───────────────────────────────┘
                                             │ (gRPC / HTTP)
                     ┌───────────────────────┴───────────────────────┐
                     ▼                                               ▼
     ┌───────────────────────────────┐               ┌───────────────────────────────┐
     │  PROJECT 2: Media Processing  │               │   PROJECT 3: Saga Engine      │
     │ • S3/MinIO Presigned Uploads  │               │ • Distributed Transactions    │
     │ • Redis/BullMQ Worker Fleet   │               │ • Transactional Outbox        │
     │ • SHA-256 Deduplication (Cost)│               │ • Kafka Event Bus             │
     │ • KEDA Queue Autoscaling      │               │ • Compensating Rollbacks      │
     └───────────────────────────────┘               └───────────────────────────────┘
                     │                                               │
                     └───────────────────────┬───────────────────────┘
                                             ▼
             ┌───────────────────────────────────────────────────────────────┐
             │              DEVOPS & OBSERVABILITY INFRASTRUCTURE            │
             │       (Docker Compose, Kubernetes HPA/KEDA, Prometheus)       │
             └───────────────────────────────────────────────────────────────┘
```

---

## 📂 Planned Monorepo Structure

```text
distributed-systems-monorepo/
├── apps/
│   ├── api-gateway/            # Project 1: Edge Proxy & Distributed Rate Limiter
│   ├── media-service/          # Project 2: Direct-to-Storage Ingestion & BullMQ Workers
│   └── saga-coordinator/      # Project 3: Distributed Transaction & Outbox Orchestrator
├── packages/
│   ├── logger/                 # Production JSON logger with Correlation IDs (Traceability)
│   ├── redis-utils/            # Distributed locking (Redlock) & Lua Rate Limiting scripts
│   └── types/                  # Shared Protobuf / TypeScript contract definitions
├── deploy/
│   ├── docker/                 # Local multi-service docker-compose
│   ├── k8s/                    # Kubernetes manifests, Helm charts, HPA, and KEDA configurations
│   └── observability/          # Prometheus metrics scrapers & Grafana dashboards
├── tests/
│   └── benchmarks/             # k6 / Locust load testing scripts (Simulating 50k+ RPS)
└── ROADMAP.md                  # Deep-dive study guide & step-by-step implementation plan
```

---

## 🎯 Coverage of Core Requirements

1. **Millions of API handling & Edge Traffic**: Project 1 (Gateway + Redis Lua Sliding Window).
2. **Huge Data & Object Storage**: Project 2 (Presigned S3/MinIO uploads bypass API memory).
3. **Cost Optimization**:
   - Storage deduplication via SHA-256 hashing.
   - Presigned URLs eliminating server network egress costs.
   - Micro-batching and Redis read-through caching.
4. **Auto-scaling & Load Balancing**:
   - NGINX reverse proxy load balancing.
   - Kubernetes HPA (CPU-based scaling) on Gateway.
   - Kubernetes KEDA (Queue-depth scaling) on Media Workers.
5. **Distributed Systems & Consistency**: Project 3 (Saga pattern, Transactional Outbox, Idempotency).
6. **DevOps & Observability**: Docker, Kubernetes, Prometheus, Grafana, GitHub Actions CI/CD.
