FROM node:alpine
RUN apk add git python3 make g++
WORKDIR /app
COPY . .
RUN npm install --no-optional
EXPOSE 10407
CMD ["npm", "start"]
