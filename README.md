# Image Flow

An asynchronous, event-driven image processing system built with NestJS and Hexagonal Architecture.

## Features
- **Image Upload:** Upload images directly to MinIO (S3-compatible storage) with metadata stored in PostgreSQL.
- **Asynchronous Processing:** Event-driven resizing triggered by MinIO webhooks.
- **Hexagonal Architecture:** Decoupled business logic from infrastructure.
- **Janitor Job:** Automated cleanup of stuck processing tasks.
- **Swagger Documentation:** Interactive API documentation.

## Tech Stack
- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** PostgreSQL with TypeORM
- **Storage:** MinIO (Object Storage)
- **Image Processing:** [sharp](https://sharp.pixelplumbing.com/)
- **Communication:** Axios for inter-service REST calls, MinIO Webhooks for events.

## Getting Started

### Prerequisites
- Docker and Docker Compose

### Running the System
1. Clone the repository.
2. Run `docker compose up --build`.
3. The API will be available at `http://localhost:3000`.
4. Swagger UI: `http://localhost:3000/api`.
5. MinIO Console: `http://localhost:9001` (login: `minioadmin` / `minioadmin`).

### Testing the flow
1. **Upload an image:**
   ```bash
   curl -X POST http://localhost:3000/images \
     -F "file=@./your-image.jpg" \
     -F "title=My Image"
   ```
2. **Check status:**
   The `processor-service` will automatically pick up the event and process the image. You can check the status via:
   ```bash
   curl http://localhost:3000/images
   ```

## Architecture
The project follows **Hexagonal Architecture** (Ports & Adapters):
- **Domain:** Pure business entities (e.g., `Image`).
- **Application:** Use cases and port interfaces (e.g., `ImageService`, `ImageRepository` port).
- **Infrastructure:** Framework-specific implementations (e.g., `TypeOrmImageRepository`, `ImageController`, `S3StorageService`).

## Services
- `image-service`: API for uploads and metadata management (Port 3000).
- `processor-service`: Worker for image processing (Internal, Port 3001).
