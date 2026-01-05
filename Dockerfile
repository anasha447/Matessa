# ==========================================
# STAGE 1: Frontend Build (React + Node 22)
# ==========================================
FROM node:22-alpine AS frontend

# 1. Set working directory
WORKDIR /app/client

# 2. Copy ALL client files (including package.json and your local node_modules)
COPY client/ ./

# 3. CRITICAL FIX for Windows Users:
# We delete the 'node_modules' folder we just copied because it contains Windows files.
# Then we install fresh dependencies for Linux.
RUN rm -rf node_modules package-lock.json
RUN npm install --legacy-peer-deps

# 4. Build the React app
RUN npm run build


# ==========================================
# STAGE 2: Backend Build (Java 21 + Maven)
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS backend

WORKDIR /app

# 1. Copy POM file
COPY matessa/pom.xml .

# 2. Download dependencies
RUN mvn dependency:go-offline -B

# 3. Copy source code
COPY matessa/src ./src

# 4. EMBED REACT: Copy the build from Stage 1
COPY --from=frontend /app/client/dist ./src/main/resources/static

# 5. Build the JAR file
RUN mvn clean package -DskipTests


# ==========================================
# STAGE 3: Production Runtime (Lite Java 21)
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 1. Copy the built JAR
COPY --from=backend /app/target/*.jar app.jar

# 2. Expose Port
EXPOSE 8080

# 3. Start App
ENTRYPOINT ["java", "-jar", "app.jar"]