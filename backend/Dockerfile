# ==============================================================================
# Multi-stage Dockerfile for Vaeto CRM Spring Boot Backend (Java 17 + Maven Wrapper)
# Optimized for production deployment on Render and container platforms.
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy Maven Wrapper files and POM first for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Normalize line endings for Windows checkouts and grant execute permission
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Pre-fetch project dependencies to leverage Docker build cache
RUN ./mvnw dependency:go-offline -B || ./mvnw dependency:resolve -B

# Copy application source code
COPY src/ ./src/

# Copy CA certificates directory
COPY certs/ ./certs/

# Package the Spring Boot executable fat JAR without running unit tests during image build
RUN ./mvnw clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime stage
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-jammy AS runner

WORKDIR /app

# Create a dedicated non-privileged user and group for security
RUN groupadd -r vaeto && useradd -r -g vaeto -m -d /app vaeto

# Copy the compiled JAR artifact from the build stage
COPY --from=builder /app/target/*.jar /app/app.jar

# Copy CA certificates into production runtime container
COPY --from=builder /app/certs /app/certs

# Set ownership to the non-privileged user
RUN chown -R vaeto:vaeto /app

# Switch to the non-root user
USER vaeto

# Configure container memory limits, default port, and default production profile
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Document the default port (Render will inject $PORT dynamically, e.g., 10000)
EXPOSE 8080

# Launch Spring Boot with dynamic Render PORT injection and graceful signal termination
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar /app/app.jar"]
