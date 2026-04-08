---
phase: monitoring
title: Monitoring & Observability
description: Define monitoring strategy, metrics, alerts, and incident response
---

# Monitoring & Observability

## Key Metrics
**What do we need to track?**

### Performance Metrics
- p50/p95 latency for catalog, cart, checkout, and webhook endpoints
- Request throughput and concurrent checkout volume
- API instance CPU, memory, and restart counts

### Business Metrics
- Checkout session creation rate
- Payment success vs cancellation/failure rate
- Coupon usage volume and order-status transition counts

### Error Metrics
- HTTP `5xx` and `4xx` rates by route
- Stripe webhook verification or processing failures
- Inventory reservation conflicts and stock-release anomalies

## Monitoring Tools
**What tools are we using?**

- **Structured application logs:** `nestjs-pino` / Pino JSON logs
- **Infrastructure monitoring:** hosting-platform CPU, memory, restart, and network graphs
- **Log aggregation:** ship JSON logs to a searchable sink such as Azure Monitor, CloudWatch, Datadog, or ELK
- **Optional APM:** OpenTelemetry or vendor APM can be added later without changing the HTTP health contract

## Logging Strategy
**What do we log and how?**

- Every HTTP request receives an `x-request-id` correlation ID for tracing across logs
- `service` and `environment` metadata are attached to request logs automatically
- Sensitive headers such as `Authorization` and cookies are redacted before logging
- Use `LOG_LEVEL=debug` locally and `LOG_LEVEL=info` in production by default
- Keep webhook and inventory warnings enabled because those flows are high-severity commerce paths

## Alerts & Notifications
**When and how do we get notified?**

### Critical Alerts
- **Readiness probe failing for 5 minutes** → page on-call and stop traffic to the instance
- **Spike in checkout/webhook failures or payment cancellations** → investigate Stripe delivery, app logs, and inventory release behavior immediately

### Warning Alerts
- **Elevated p95 latency on `/checkout/session` or `/orders/*`** → inspect DB/Redis health and scaling pressure
- **Redis fallback mode detected unexpectedly in staging/production** → investigate cache connectivity and failover status

## Dashboards
**What do we visualize?**

- **System health dashboard:** liveness/readiness results, restart count, CPU, memory, and error rate
- **Commerce dashboard:** checkout creation, webhook completion, paid vs cancelled orders, and coupon redemption trends
- **Operations dashboard:** DB availability, Redis state, and request traces grouped by `x-request-id`

## Incident Response
**How do we handle issues?**

### On-Call Rotation
- Primary owner: backend/API maintainer
- Secondary owner: platform/infrastructure maintainer
- Escalate payment-impacting incidents immediately because they affect revenue and stock accuracy

### Incident Process
1. Detect via alerts or failed health checks
2. Triage with `/api/v1/health/ready` and correlated request logs
3. Mitigate by rolling back or routing around the failing dependency
4. Record root cause, timeline, and follow-up actions in a post-incident note

## Health Checks
**How do we verify system health?**

- **`GET /api/v1/health/live`** → returns `200` when the NestJS process is up
- **`GET /api/v1/health/ready`** → returns dependency-aware status for Prisma, Redis/cart persistence, and runtime memory
- **`STRICT_HEALTH_CHECKS=true`** makes degraded dependencies fail readiness in staging/production
- Re-run a smoke flow after deploy: login → add cart item → create checkout session → post test webhook

