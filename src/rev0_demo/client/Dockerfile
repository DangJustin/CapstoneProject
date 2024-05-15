FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY public /app/public
COPY src/ /app/src
RUN npm run build
RUN npm install serve -g
EXPOSE 3000
CMD [ "serve", "-s", "build"]