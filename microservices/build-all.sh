#!/bin/bash

echo "Building all microservices..."

# Build Discovery Server
echo "Building Discovery Server..."
cd discovery-server
./gradlew build -x test
cd ..

# Build API Gateway
echo "Building API Gateway..."
cd api-gateway
./gradlew build -x test
cd ..

# Build User Management Service
echo "Building User Management Service..."
cd user-management-service
./gradlew build -x test
cd ..

# Build Form Management Service
echo "Building Form Management Service..."
cd form-management-service
./gradlew build -x test
cd ..

# Build Group Management Service
echo "Building Group Management Service..."
cd group-management-service
./gradlew build -x test
cd ..

# Build Form Submission Service
echo "Building Form Submission Service..."
cd form-submission-service
./gradlew build -x test
cd ..

# Build Reports Service
echo "Building Reports Service..."
cd reports-service
./gradlew build -x test
cd ..

echo "All microservices built successfully!"
echo "You can now run: docker-compose up -d"
