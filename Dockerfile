FROM node:22-alpine
WORKDIR /app
COPY package*.json . 
RUN npm install
COPY . .
RUN npm run install:all
EXPOSE 5173
CMD ["npm","run","dev:all"]