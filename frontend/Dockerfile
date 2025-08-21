# Dockerfile.dev
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm instead of yarn to avoid lock file issues
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
