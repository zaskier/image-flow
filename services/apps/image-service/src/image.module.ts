import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { Image } from "./domain/entities/image.entity";
import { ImageService } from "./application/services/image.service";
import { ImageRepositoryToken } from "./application/ports/image.repository";
import { TypeOrmImageRepository } from "./infrastructure/repositories/typeorm-image.repository";
import { ImageController } from "./infrastructure/adapters/image.controller";
import { S3ConfigService } from "./infrastructure/storage/s3-config.service";
import { MulterConfigService } from "./infrastructure/storage/multer-config.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.registerAsync({
      imports: [ImageModule],
      useClass: MulterConfigService,
    }),
  ],
  controllers: [ImageController],
  providers: [
    ImageService,
    S3ConfigService,
    MulterConfigService,
    {
      provide: ImageRepositoryToken,
      useClass: TypeOrmImageRepository,
    },
  ],
  exports: [ImageService, S3ConfigService],
})
export class ImageModule {}
