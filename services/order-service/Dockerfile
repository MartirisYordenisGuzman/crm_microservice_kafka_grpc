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
# RUN cd shared && npm install && npm run build
RUN cd shared && npm install && npm run build

# Copy order-service package files
COPY ./services/order-service/package.json ./
RUN npm install

# Create symlink in node_modules to the built shared module
RUN ln -sf /app/shared /app/node_modules/shared

# Copy order-service source files
COPY ./services/order-service/src ./src
COPY ./services/order-service/tsconfig.json ./

# Copy and make wait-for-it executable
COPY ./docker/wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

RUN npm run generate-proto

# Build the order-service
RUN npm run build

EXPOSE 50053

# Use shell form to ensure proper execution
CMD ./wait-for-it.sh order-db:5432 -- npm start