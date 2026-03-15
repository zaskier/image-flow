import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { ScheduleModule } from "@nestjs/schedule";
import { ClientsModule } from "@nestjs/microservices";
import { CacheModule } from "@nestjs/cache-manager";
import { Image } from "./infrastructure/database/entities/image.entity";
import { ImageService } from "./application/services/image.service";
import { JanitorService } from "./application/services/janitor.service";
import { ImageRepositoryToken } from "./application/ports/image.repository";
import { TypeOrmImageRepository } from "./infrastructure/repositories/typeorm-image.repository";
import { ImageController } from "./infrastructure/adapters/image.controller";
import { MulterConfigService } from "./infrastructure/storage/multer-config.service";
import { LoggerModule } from "@common/logger/logger.module";
import { S3Module } from "@common/s3/s3.module";
import { RABBITMQ_SERVICE } from "@common/constants/rabbitmq.constants";
import { getRabbitMqConfig } from "./infrastructure/messaging/rabbitmq.config";
import { getRedisConfig } from "./infrastructure/cache/redis.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: RABBITMQ_SERVICE,
        ...getRabbitMqConfig(),
      },
    ]),
    CacheModule.registerAsync({
      useFactory: async () => await getRedisConfig(),
    }),
    MulterModule.registerAsync({
      imports: [ImageModule, S3Module],
      useClass: MulterConfigService,
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    S3Module,
  ],
  controllers: [ImageController],
  providers: [
    ImageService,
    JanitorService,
    MulterConfigService,
    {
      provide: ImageRepositoryToken,
      useClass: TypeOrmImageRepository,
    },
  ],
  exports: [ImageService],
})
export class ImageModule {}
