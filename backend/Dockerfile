FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace/app

COPY gradle gradle
COPY gradlew .
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY src src

RUN ./gradlew build -x test

FROM eclipse-temurin:17-jre
VOLUME /tmp
COPY --from=build /workspace/app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
