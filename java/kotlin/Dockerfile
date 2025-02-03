# Start with a base image containing Java runtime
FROM amazoncorretto:21-alpine3.21-jdk
# FROM gradle:jdk21-alpine

# Create a directory
WORKDIR /app

# Copy all the files from the current directory to the image
COPY . .

# build the project avoiding tests
# RUN ./gradlew --refresh-dependencies --no-daemon
RUN ./gradlew clean build -x test

# Expose port 8080
EXPOSE 8080

# Run the jar file
CMD ["java", "-jar", "./build/libs/backend-0.0.1-SNAPSHOT.jar"]
