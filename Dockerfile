# ==========================================
# STAGE 1: Frontend Build (React + Node 22)
# ==========================================
FROM node:22-alpine AS frontend

# 1. Set working directory for client files
WORKDIR /app/client

# 2. Copy dependency files first (from local 'client' folder)
COPY client/package*.json ./

# 3. Install dependencies
# We use --legacy-peer-deps to solve the React conflict you had earlier
RUN npm install --legacy-peer-deps

# 4. Copy the rest of the client source code
COPY client/ ./

# 5. Build the React app
# This generates the 'dist' folder
RUN npm run build


# ==========================================
# STAGE 2: Backend Build (Java 21 + Maven)
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS backend

WORKDIR /app

# 1. Copy POM file (flattening the structure: matessa/pom.xml -> ./pom.xml)
COPY matessa/pom.xml .

# 2. Download dependencies (Cache layer)
RUN mvn dependency:go-offline -B

# 3. Copy the Java source code
COPY matessa/src ./src

# 4. EMBED REACT: Copy the build from Stage 1 into the Spring Boot static folder
# We take files from '/app/client/dist' and put them in 'src/main/resources/static'
COPY --from=frontend /app/client/dist ./src/main/resources/static

# 5. Build the JAR file
RUN mvn clean package -DskipTests


# ==========================================
# STAGE 3: Production Runtime (Lite Java 21)
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 1. Copy the built JAR from Stage 2
COPY --from=backend /app/target/*.jar app.jar

# 2. Expose the standard Spring Boot port
EXPOSE 8080

# 3. Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]