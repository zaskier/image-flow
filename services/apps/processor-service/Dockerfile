FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY services/common ./services/common
COPY services/apps/processor-service ./services/apps/processor-service

RUN cd services/common && npm install && npm run build

RUN cd services/apps/processor-service && npm install && npm run build

# Production stage
FROM node:24-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/services/common ./services/common
COPY --from=builder /usr/src/app/services/apps/processor-service ./services/apps/processor-service

WORKDIR /usr/src/app/services/apps/processor-service

EXPOSE 3015

CMD ["node", "dist/main"]
