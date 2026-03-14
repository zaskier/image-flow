import { Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { HttpLoggingMiddleware } from "./http-logging.middleware";

@Module({
  providers: [LoggerService, HttpLoggingMiddleware],
  exports: [LoggerService, HttpLoggingMiddleware],
})
export class LoggerModule {}
