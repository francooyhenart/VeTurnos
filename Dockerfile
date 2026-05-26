# ── ETAPA 1: Build ──────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copiamos solo el pom.xml primero para cachear dependencias
COPY Backend/pom.xml .
RUN mvn dependency:go-offline -B

# Ahora copiamos el resto del código y compilamos
COPY Backend/src ./src
RUN mvn package -DskipTests -B

# ── ETAPA 2: Runtime ────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]