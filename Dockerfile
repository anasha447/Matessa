# ==========================================
# STAGE 1: Frontend Build (React + Node 22)
# ==========================================
FROM node:22-alpine AS frontend

WORKDIR /app/client

# 1. Copy package files first (Optimization for caching)
# We assume package.json is directly inside the 'client' folder
COPY client/package*.json ./

# 2. Install dependencies (Clean install for Linux)
# We do this BEFORE copying the rest of the code to save time on redeploys
RUN npm install --legacy-peer-deps

# 3. Copy the rest of the source code
COPY client/ ./

# 4. Build the React app
# IMPORTANT: This creates a 'dist' folder (Vite) or 'build' folder (CRA)
RUN npm run build


# ==========================================
# STAGE 2: Backend Build (Java 21 + Maven)
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS backend

WORKDIR /app

# 1. Copy POM file
COPY matessa/pom.xml .

# 2. Download dependencies (Offline mode)
RUN mvn dependency:go-offline -B

# 3. Copy source code
COPY matessa/src ./src

# 4. 🧹 CLEANUP & PREPARE: Ensure static folder is empty and exists
RUN rm -rf src/main/resources/static/*
RUN mkdir -p src/main/resources/static

# 5. 🚨 EMBED REACT: Copy the build from Stage 1
# NOTE: Check if your local project uses 'dist' (Vite) or 'build' (Create-React-App)
# If using Create-React-App, change '/app/client/dist' to '/app/client/build' below:
COPY --from=frontend /app/client/dist ./src/main/resources/static/

# 6. Build the JAR file
# We skip tests to speed up deployment
RUN mvn clean package -DskipTests


# ==========================================
# STAGE 3: Production Runtime (Lite Java 21)
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 1. Copy the built JAR
COPY --from=backend /app/target/*.jar app.jar

# 2. Expose Port (Must match Dokploy setting)
EXPOSE 8080

# 3. Start App
ENTRYPOINT ["java", "-jar", "app.jar"]