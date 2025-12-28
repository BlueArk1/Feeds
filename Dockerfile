FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5173
CMD [ "npm", "run", "install:all" ]
CMD [ "npm", "run", "dev:app" ]
CMD [ "npm", "run", "dev:server" ]