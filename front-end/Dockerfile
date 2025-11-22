# Base image
FROM node:18

# Làm việc trong thư mục container
WORKDIR /app

# Copy package.json và lock file để cache install
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code (bao gồm /src/app)
COPY . .

# Mở port dev
EXPOSE 3000

# Chạy Next.js ở dev mode
CMD ["npm", "run", "dev"]
