# Paso 1: Build del proyecto usando Maven con Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .

# Forzar permisos de ejecución para Linux
RUN chmod +x ./mvnw

RUN ./mvnw clean package -DskipTests

# Paso 2: Imagen liviana para correr la app
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]