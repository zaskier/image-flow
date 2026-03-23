import { RmqOptions, Transport } from "@nestjs/microservices";
import { IMAGE_PROCESS_QUEUE } from "@common/constants/rabbitmq.constants";

export const getRabbitMqConfig = (): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
    queue: IMAGE_PROCESS_QUEUE,
    noAck: false,
    prefetchCount: 1,
    queueOptions: {
      durable: true,
    },
    socketOptions: {
      heartbeatIntervalInSeconds: 60,
      reconnectTimeInSeconds: 5,
    },
  },
});
