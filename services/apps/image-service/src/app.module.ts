import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./infrastructure/adapters/app.controller";
import { AppService } from "./application/services/app.service";
import { typeOrmConfig } from "./infrastructure/database/ormconfig";
import { ImageModule } from "./image.module";
import { LoggerModule } from "@common/logger/logger.module";
import { HttpLoggingMiddleware } from "@common/logger/http-logging.middleware";

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), ImageModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware).forRoutes("*");
  }
}
