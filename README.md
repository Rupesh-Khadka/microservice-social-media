# 🚀 Comprehensive Node.js Development Course

Welcome to the **Comprehensive Node.js Development Course**! This project is a hands-on learning journey for mastering modern backend development using Node.js. Whether you're a beginner or intermediate developer, this course will help you build robust, scalable backend applications using the most in-demand technologies.

---

## 📚 What You'll Learn

This course covers a broad range of backend technologies and practices:

- **Node.js Fundamentals**
- **Express.js** – RESTful API design
- **Redis** – In-memory data store
- **RabbitMQ** – Message queuing for async communication
- **Docker** – Containerization of services
- **CI/CD with GitHub Actions** – Automating build & deployment
- **VPS Hosting** – Deploying applications to a virtual private server

---

## 🧱 Microservices Architecture

This project demonstrates a complete microservices-based architecture for a **Social Media Application**, consisting of the following services:

### 1. 🔐 Identity Service
Handles user authentication, registration, and JWT-based authorization.

### 2. 📝 Post Service
Manages post creation, editing, deletion, and user feeds.

### 3. 🔍 Search Service
Implements search functionality across posts and user profiles.

### 4. 📦 API Gateway
Acts as a reverse proxy to route requests to the correct service and handles centralized error management and logging.

### 5. 📬 Message Queue Service
Built with **RabbitMQ**, this service enables communication between microservices asynchronously.

### 6. 🧠 Redis Service
Used for caching and performance optimization (e.g., storing frequently accessed data, rate limiting).

### 7. 📸 Media Service
Handles image/video upload, hosted using:
- **AWS S3** – Secure file storage
- **Dockerized** and hosted via:
  - **AWS ECR (Elastic Container Registry)**
  - **AWS ECS (Elastic Container Service)**

---

## 📁 Project Structure

```bash
comprehensive-nodejs-course/
│
├── api-gateway/
├── identity-service/
├── post-service/
├── search-service/
├── message-queue-service/
├── media-service/
├── docker-compose.yml
├── .github/workflows/  # GitHub Actions for CI/CD
└── README.md
