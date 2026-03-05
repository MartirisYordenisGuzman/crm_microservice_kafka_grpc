# crm_microservices_kafka_grpc

IMPORTANT: this repository is intended to be run only with Docker / docker-compose. Running services individually outside of Docker is unsupported by this README.

This monorepo contains a small microservices CRM example implemented in TypeScript. Services are designed to run as containerized microservices and communicate via Kafka and gRPC/protobuf where applicable. The repository also includes a monitoring stack (Prometheus, Grafana, ELK) and helper scripts.

## High-level architecture

- Gateway (HTTP) — `services/api-gateway`
- Domain services — `services/order-service`, `services/product-service`, `services/user-service`
- Shared libraries & protobufs — `shared/` (protobuf definitions, Kafka clients, common utilities)
- Messaging — Kafka (used for events between services)
- Persistence — each service manages its own database (see each service's config)
- Observability — Prometheus + Grafana + ELK (filebeat, logstash) under `monitoring/`

Runtime interactions (simplified):

- External clients call the API Gateway (HTTP). The gateway forwards requests to domain services (HTTP/gRPC) or publishes/consumes events via Kafka.
- Domain services own their data and communicate asynchronously using Kafka events defined by protobufs in `shared/proto/`.
- Monitoring components scrape/collect metrics/logs from services and from infrastructure (Prometheus, Filebeat -> Logstash -> Elasticsearch, Grafana dashboards).

ASCII overview:

```
 [Client] --> [API Gateway]
										|--> [User Service]
										|--> [Product Service]
										|--> [Order Service]

	 Services <--> Kafka (events)
	 Services --> Databases (per-service)
	 Services --> Prometheus (metrics)
	 Logs --> Filebeat -> Logstash -> Elasticsearch
	 Grafana reads Prometheus / Elasticsearch dashboards
```

## Why Docker-only

This project is wired together in docker-compose with multiple infrastructure components (Kafka, Zookeeper/if used, Elasticsearch, Prometheus, Grafana). Reproducing that topology locally without Docker is fragile and out-of-scope for this repository; therefore the supported execution method is the compose setup.

## Quick start (Docker)

From the repository root (must use Docker and docker-compose):

```sh
# build images and start everything in attached mode
docker-compose up --build

# or start in background
docker-compose up --build -d

# view logs for all services
docker-compose logs -f

# stop and remove containers
docker-compose down
```

Notes:
- If you modify code and need the container image updated, re-run `docker-compose build` (or `docker-compose up --build`).
- Services expect environment variables defined in the compose files or `.env` files referenced there. Do not run services manually outside Docker.

## Project structure (detailed)

- `docker-compose.yml` — root compose file that wires services, Kafka, and monitoring.
- `docker/` — helper scripts (e.g., `wait-for-it.sh`).
- `services/`
	- `api-gateway/` — API gateway service, HTTP entrypoint for clients; contains `Dockerfile`, `package.json`, TypeScript sources in `src/`.
	- `order-service/` — order domain service (DB config, repository, service layers, Dockerfile).
	- `product-service/` — product domain service (includes consumer config for orders, Dockerfile).
	- `user-service/` — user domain service.

- `shared/`
	- `proto/` — all protobuf definitions (e.g., `order.proto`, `product.proto`, `user.proto`, `notification.proto`). These are the contracts used for events and gRPC if used.
	- `src/config` — shared runtime config helpers (kafka, database, etc.).
	- `src/kafka` — messaging abstractions and implementations.
	- `src/cache` — cache abstractions (Redis implementation present).
	- `src/repository` and `src/services` — shared repository/service contracts.

- `monitoring/` — Prometheus, Grafana dashboards, and ELK pipeline configs.

Each service has a `Dockerfile` and service-local `tsconfig.json` and `package.json`. Build artifacts (when generated during image build) are typically placed into `dist/` or similar inside the service container; local developer builds are not covered in this README since only Docker execution is supported.

## Configuration and environment

- The compose file(s) define environment variables and mount points. Check `docker-compose.yml` for service-specific env vars and volumes.
- Secrets or sensitive values should be provided through your Docker environment or an appropriate secrets manager — do not commit secrets to the repository.

## Observability

- Prometheus configuration lives in `monitoring/prometheus/prometheus.yml` and scrapes metrics exposed by services.
- Grafana dashboards in `monitoring/grafana/dashboards/` include a microservices dashboard.
- ELK pipeline configuration is under `monitoring/elk/` (Filebeat and Logstash configs).

## Common commands (copy/paste)

```sh
# build and start
docker-compose up --build -d

# rebuild a single service image (example: api-gateway) and restart it
docker-compose build services_api-gateway
docker-compose up -d services_api-gateway

# follow logs for a service
docker-compose logs -f services_api-gateway

# teardown
docker-compose down -v
```

Replace `services_api-gateway` with the full service name from `docker-compose ps` if your compose uses project/service prefixes.

## Development workflow (Docker-centric)

1. Edit code in the service folder locally.
2. Rebuild the image: `docker-compose build <service>`.
3. Restart the service container: `docker-compose up -d <service>`.
4. Check logs: `docker-compose logs -f <service>`.

For faster iteration you can mount source into the container in development-specific compose overrides (not included by default). If you add such an override, make sure the container still waits for dependent infra using the helper scripts in `docker/`.

## Adding a new service

1. Add a new folder under `services/` with `src/`, `Dockerfile`, and `package.json`.
2. Add the service to `docker-compose.yml` (image build context, ports, environment, depends_on).
3. If the service emits or consumes events, add or reuse appropriate protobuf definitions under `shared/proto/` and update any code generation steps you use.

## Troubleshooting

- If a service fails to start because it cannot connect to Kafka or DB, check `docker-compose ps` and `docker-compose logs <service>` for errors. Ensure the infra containers (Kafka, DB) are healthy.
- If protobuf-generated code is missing inside an image, ensure your Dockerfile runs the proto generation step or includes the generated artifacts.

## Where to look in the codebase

- API Gateway entrypoint: `services/api-gateway/src/index.ts` or `src/app.ts`.
- Service containers and DI setup: `services/*/src/containers.ts`.
- Shared kafka and messaging helpers: `shared/src/kafka/` and `shared/src/config/kafka.ts`.
- Protobuf definitions: `shared/proto/`.

## License

MIT (adjust as appropriate)

---
