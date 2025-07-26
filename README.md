# 🚀 Scalable Node.js Backend – Personal Project

This repository contains the backend infrastructure for a scalable **social media platform**, built using a **microservices architecture** with **Node.js**. Each service is independently deployable, containerized with Docker, and communicates via REST APIs and message queues. This project reflects my personal exploration into designing production-grade backend systems using modern DevOps and cloud-native tools.

---

## 🧰 Tech Stack

- **Node.js** – Backend runtime
- **Express.js** – Web framework for RESTful APIs
- **Redis** – In-memory store for caching and rate limiting
- **RabbitMQ** – Asynchronous communication between services
- **Docker** – Containerization for local and production environments
- **GitHub Actions** – CI/CD pipelines
- **AWS S3 / ECR / ECS** – Media storage & container hosting
- **VPS** – Hosting backend services

---

## 🧱 Microservices Overview

This project includes the following core services:

### 🔐 Identity Service
- Handles user authentication and registration
- JWT-based token authentication
- Role-based access control

### 📝 Post Service
- Create, update, delete posts
- Manages user timelines and feeds

### 🔍 Search Service
- Full-text search over posts and users

### 📦 API Gateway
- Central access point for routing requests
- Handles logging and error management

### 📬 Message Queue Service
- Uses RabbitMQ for asynchronous communication between services

### 🧠 Redis Service
- Used for caching and rate limiting
- Optimizes response times for frequently accessed endpoints

### 📸 Media Service
- Handles image and video uploads
- Integrates with:
  - **AWS S3** for file storage
  - **Docker** + **ECR/ECS** for deployment

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
