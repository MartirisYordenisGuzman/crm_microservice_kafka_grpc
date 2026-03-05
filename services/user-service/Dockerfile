FROM node:22-alpine

WORKDIR /app

RUN apk update && apk add --no-cache \
    protoc \
    protobuf \
    protobuf-dev \
    bash  # Add bash for wait-for-it.sh

# Verify protoc installation
RUN protoc --version

# Copy the entire shared module first
COPY ./shared ./shared/

# Install and build shared module
RUN cd shared && npm install && npm run build

# Copy user-service package files
COPY ./services/user-service/package.json ./
RUN npm install

# Create symlink in node_modules to the built shared module
RUN ln -sf /app/shared /app/node_modules/shared

# Copy user-service source files
COPY ./services/user-service/src ./src
COPY ./services/user-service/tsconfig.json ./

# Copy and make wait-for-it executable
COPY ./docker/wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

RUN npm run generate-proto

# Build the user-service
RUN npm run build

EXPOSE 50051

# Use shell form to ensure proper execution
CMD ./wait-for-it.sh user-db:5432 -- npm start