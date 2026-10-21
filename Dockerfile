# =========================================================================
# Stage 1: Build executable Spring Boot fat JAR with Maven and Java 21
# =========================================================================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml and cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy Java backend source code (React frontend is excluded)
COPY src ./src

# Compile and package executable fat JAR (skips unit tests for container build)
RUN mvn clean package -DskipTests

# =========================================================================
# Stage 2: Production runtime image using Eclipse Temurin JRE 21
# =========================================================================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the executable Spring Boot JAR from builder stage
COPY --from=builder /app/target/studentattendancesystem-1.0.0.jar app.jar

# Render dynamically assigns a port via the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Execute Spring Boot using exec so signals (SIGTERM) are handled cleanly by Java
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
