# Image Flow

An asynchronous, event-driven image processing system built with NestJS and Hexagonal Architecture.

## Features
- **Image Upload:** Upload images directly to MinIO (S3-compatible storage) with optional dimensions (width/height).
- **Asynchronous Processing:** Event-driven resizing triggered via **RabbitMQ** message queue.
- **Scalability:** Horizontal scaling of processing workers.
- **Caching:** Redis-backed caching for image listing endpoint (first 2 pages).
- **Hexagonal Architecture:** Decoupled business logic from infrastructure.
- **Janitor Job:** Automated cleanup of stuck processing tasks.
- **Swagger Documentation:** Interactive API documentation.

## Tech Stack
- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** PostgreSQL with TypeORM
- **Message Queue:** RabbitMQ
- **Cache:** Redis
- **Storage:** MinIO (Object Storage)
- **Image Processing:** [sharp](https://sharp.pixelplumbing.com/)
- **Dependency Management:** Monorepo using npm workspaces.

## Getting Started

### Prerequisites
- Docker and Docker Compose

### Running the System
1. Clone the repository.
2. Run `docker compose up --build` from the root directory.
3. The API will be available at `http://localhost:3000` (mapped to internal port 3005).
4. Swagger UI: `http://localhost:3000/api`.
5. MinIO Console: `http://localhost:9001` (login: `minioadmin` / `minioadmin`).
6. RabbitMQ Management UI: `http://localhost:15672` (login: `guest` / `guest`).

### Testing the flow
1. **Upload an image with dimensions:**
   ```bash
   curl -X POST http://localhost:3000/images \n     -F "file=@./your-image.jpg" \n     -F "title=My Image" \n     -F "width=200" \n     -F "height=200"
   ```
2. **Check status:**
   The `processor-service` workers will pick up the task from RabbitMQ. You can check the status via:
   ```bash
   curl http://localhost:3000/images
   ```
   *Note: The first two pages of results are cached for 60 seconds.*

## Architecture
The project follows **Hexagonal Architecture** (Ports & Adapters):
- **Domain:** Pure business entities (e.g., `Image`).
- **Application:** Use cases and port interfaces (e.g., `ImageService`, `ImageRepository` port).
- **Infrastructure:** Framework-specific implementations (e.g., `TypeOrmImageRepository`, `ImageController`, `RabbitMqPublisher`).

## Services
- `image-service`: API for uploads and metadata management (External port 3000).
- `processor-service`: Worker for image processing (Scalable via `--scale processor-service=N`).
- `common`: Shared code and utilities used by all services.
