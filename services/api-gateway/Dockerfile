FROM node:22-alpine

WORKDIR /app

# Copy the entire shared module first
COPY ./shared ./shared/

# Install and build shared module
RUN cd shared && npm install && npm run build

# Copy api-gateway package files
COPY ./services/api-gateway/package.json ./
RUN npm install

# Create symlink in node_modules to the built shared module
RUN ln -sf /app/shared /app/node_modules/shared

# Copy api-gateway source files
COPY ./services/api-gateway/src ./src
COPY ./services/api-gateway/tsconfig.json ./

# Build the api-gateway
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]