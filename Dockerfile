# ===============================
# Stage 1: Build React Frontend
# ===============================
FROM node:20-alpine as frontend-build

# Set working directory inside container
WORKDIR /app/client

# 1. Copy package files from your LOCAL 'client' folder
COPY client/package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy the rest of the React code
COPY client/ ./

# 4. Build the React app
# CHECK: Does your project build to 'dist' or 'build'? 
# Vite usually uses 'dist'. Create-React-App uses 'build'.
RUN npm run build

# ===============================
# Stage 2: Build Spring Boot Backend
# ===============================
# Using Java 21 based on your pom.xml (adjusted)
FROM maven:3.9-eclipse-temurin-21 as backend-build

WORKDIR /app

# 1. Copy pom.xml from ROOT
COPY pom.xml .

# 2. Copy Java source code from ROOT
COPY src ./src

# 3. Copy the React Build into Spring Boot's static folder
# INFO: This allows Spring Boot to serve the frontend
COPY --from=frontend-build /app/client/dist /app/src/main/resources/static

# 4. Build the JAR file
RUN mvn clean package -DskipTests

# ===============================
# Stage 3: Run the Application
# ===============================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a volume folder for image uploads
RUN mkdir -p /app/images

# Copy the built JAR from Stage 2
COPY --from=backend-build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]