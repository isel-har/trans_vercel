FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY sources ./

RUN chmod +x ./next_entrypoint.sh

CMD [ "sh", "./next_entrypoint.sh" ]
