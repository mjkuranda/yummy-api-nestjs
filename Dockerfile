FROM node:latest
LABEL authors="mkuranda"

WORKDIR /app

COPY . .

RUN npm i -g @nestjs/cli
RUN npm i
RUN nest build

EXPOSE 3001

CMD ["nest", "start"]