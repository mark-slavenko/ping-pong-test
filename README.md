# 🏓 EMCP Baseline NestJS Backend - Ping Pong Challenge

A production-ready, Dockerized full-stack application demonstrating real-time communication using NestJS, React, and Redis Streams.

## 🚀 Features

* **Event-Driven Architecture**: Decoupled Producer and Consumer services using Redis Streams.
* **Real-Time Updates**: WebSocket Gateway for instant client notifications.
* **Scalable Backend**: NestJS modular architecture with separation of concerns.
* **Modern Frontend**: React + Vite + TypeScript for a fast and type-safe client experience.
* **Dockerized**: Fully containerized environment (Frontend, Backend, Redis) ready for deployment.

## 🛠 Tech Stack

* **Backend**: NestJS, TypeScript, socket.io, ioredis
* **Frontend**: React, Vite, TypeScript, Nginx (for serving static assets)
* **Infrastructure**: Docker, Docker Compose, Redis (Alpine)

## 🏃‍♂️ How to Run

### Prerequisites
* Docker & Docker Compose

### Quick Start (Recommended)
The entire stack is configured to run with a single command:

```bash docker-compose up --build ```

Once the containers are running, access the application at: http://localhost:8080

### Local Development (Manual)
If you want to run services individually without Docker:

#### Start Redis:

```bash docker-compose up -d redis```

#### Backend:

```bash 
cd be
npm install
npm run start:dev
``` 
Server runs on http://localhost:3000

#### Frontend:

```bash
cd fe
npm install
npm run dev
```
Client runs on http://localhost:5173
## 🏗 Architecture Decisions & Implementation Choices
### 1.Redis Streams over Pub/Sub
Per requirements, I utilized Redis Streams (XADD, XREAD) instead of standard Pub/Sub.

Why? Streams provide data persistence and consumer groups capabilities. Unlike Pub/Sub (fire and forget), Streams ensure that if the consumer service is down, messages are not lost and can be processed later.

### 2. Separation of Producer and Consumer
I implemented two distinct mechanisms within the Redis Module:

Producer: Handles the HTTP REST request and strictly writes to the stream.

Consumer: A background service (OnModuleInit) that maintains a dedicated blocking connection (BLOCK 0) to Redis to listen for new messages.

Blocking Fix: I used separate Redis connections for the Publisher and Subscriber to prevent the blocking XREAD command from freezing the entire application's event loop or preventing new writes.

### 3. Monorepo Structure
The project is organized as a monorepo containing both be (Backend) and fe (Frontend) directories. This simplifies version control and dependency management for this challenge.

### 4. Docker Multi-Stage Builds
Both Backend and Frontend use multi-stage Docker builds to keep the final image size small and secure:

Backend: Compiles TypeScript and runs only the production build (dist/main).

Frontend: Builds the React static files and serves them via high-performance Nginx server, rather than running a Node.js development server in production.

## 📝 API Endpoints
### POST /api/ping
Sends a ping message to the Redis Stream.

Body:
```JSON
{
  "clientId": "string"
}
```
Response:

```JSON
{
  "status": "ack",
  "messageId": "1706...",
  "info": "Request queued"
}
```

## ⚠️ Implementation Notes & Trade-offs

### Message Persistence (XREAD vs XGROUP)
For this baseline implementation, I utilized `XREAD` with the special ID `$` (read new messages only).
**Trade-off:** If the backend service restarts, messages arriving during the downtime will be skipped.
**Production Improvement:** In a real-world scenario, I would implement **Redis Consumer Groups (`XGROUP`)**. This would allow the service to:
1. Track the `last_delivered_id` persistently.
2. Resume processing from where it left off after a restart.
3. Scale horizontal workers (load balancing) without processing duplicate messages.

### Error Handling
* **Global Exception Filter**: Added to ensure consistent JSON error responses for the REST API.
* **Graceful Shutdown**: Implemented `OnModuleDestroy` to close Redis connections cleanly, preventing zombie connections on the Redis server.