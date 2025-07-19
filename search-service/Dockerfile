#Build source
FROM node:20-alpine AS build

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only dependency-related files first for layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application code
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript (into ./dist)
RUN npm run prisma:generate
RUN npm run build

# Run app
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript and any required assets
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma

# If you're using a .env file, you can copy it here (optional)
COPY .env ./

# Set environment variable (can also be passed from docker-compose)
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3004
# Run the server
CMD ["node", "dist/server.js"]
