FROM node:18-alpine

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY app/package*.json ./
RUN npm install --production

# Copy application source files
COPY app .

EXPOSE 3000

CMD ["node", "index.js"]
