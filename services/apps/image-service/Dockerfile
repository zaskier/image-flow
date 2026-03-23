FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY services/common ./services/common
COPY services/apps/image-service ./services/apps/image-service

RUN cd services/common && npm install && npm run build

RUN cd services/apps/image-service && npm install && npm run build

# Production stage
FROM node:24-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/services/common ./services/common
COPY --from=builder /usr/src/app/services/apps/image-service ./services/apps/image-service

WORKDIR /usr/src/app/services/apps/image-service

EXPOSE 3005

CMD ["node", "dist/main"]
