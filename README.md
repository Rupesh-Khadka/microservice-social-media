# 🚀 Scalable Node.js Backend – Personal Project

This repository contains the backend infrastructure for a scalable **social media platform**, built using a **microservices architecture** with **Node.js**. Each service is independently deployable, containerized with Docker, and communicates via REST APIs and message queues. This project reflects my personal exploration into building production-grade backend systems using modern DevOps and cloud-native tools.

---

## 🧰 Tech Stack

- **Node.js** – Backend runtime
- **Express.js** – Web framework for RESTful APIs
- **Redis** – In-memory store for caching and rate limiting
- **RabbitMQ** – Asynchronous messaging between services
- **Docker** – Containerization for local development and production
- **GitHub Actions** – CI/CD automation
- **AWS ECS (Elastic Container Service)** – Container orchestration
- **AWS ECR (Elastic Container Registry)** – Docker image hosting
- **AWS S3** – Media storage

---

## 🧱 Microservices Overview

This project includes the following core services:

### 🔐 Identity Service
- User authentication and registration
- JWT-based authentication
- Role-based access control

### 📝 Post Service
- Create, update, delete posts
- Timeline/feed generation

### 🔍 Search Service
- Full-text search over users and posts

### 📦 API Gateway
- Routes incoming requests to internal services
- Centralized error handling and logging

### 📬 Message Queue Service
- Uses RabbitMQ for inter-service async communication

### 🧠 Redis Service
- Used for caching and rate limiting
- Improves performance and scalability

### 📸 Media Service
- Handles image/video uploads
- Integrates with:
  - **AWS S3** for secure file storage
  - **Docker + AWS ECR/ECS** for containerized deployment

---

## 📁 Project Structure

```bash
scalable-nodejs-backend/
│
├── api-gateway/
├── identity-service/
├── post-service/
├── search-service/
├── message-queue-service/
├── media-service/
├── docker-compose.yml
├── .github/workflows/        # GitHub Actions CI/CD pipelines
└── README.md
