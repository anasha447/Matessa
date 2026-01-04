# ===============================
# Stage 1: Build React Frontend
# ===============================
FROM node:20-alpine as frontend-build

WORKDIR /app/client

# Copy frontend files (Make sure 'client' is in the root!)
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ===============================
# Stage 2: Build Spring Boot Backend
# ===============================
FROM maven:3.9-eclipse-temurin-21 as backend-build

WORKDIR /app

# --- FIX: Look inside the 'matessa' folder ---
# 1. Copy pom.xml from the matessa folder
COPY matessa/pom.xml .

# 2. Copy Java source code from the matessa folder
COPY matessa/src ./src

# 3. Copy React Build to Static folder
COPY --from=frontend-build /app/client/dist /app/src/main/resources/static

# 4. Build the JAR
RUN mvn clean package -DskipTests

# ===============================
# Stage 3: Run the Application
# ===============================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create volume for images
RUN mkdir -p /app/images

# Copy the JAR
COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]