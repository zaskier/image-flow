import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { ImageProcessorService } from "./application/services/image-processor.service";
import { WebhookController } from "./infrastructure/adapters/webhook.controller";
import { ImageApiServiceToken } from "./application/ports/image-api.service";
import { HttpImageApiService } from "./infrastructure/adapters/http-image-api.service";
import { StorageServiceToken } from "./application/ports/storage.service";
import { S3StorageService } from "./infrastructure/storage/s3-storage.service";
import { ImageProcessorToken } from "./application/ports/image-processor";
import { SharpImageProcessor } from "./infrastructure/image-processing/sharp-image-processor";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [WebhookController],
  providers: [
    ImageProcessorService,
    {
      provide: ImageApiServiceToken,
      useClass: HttpImageApiService,
    },
    {
      provide: StorageServiceToken,
      useClass: S3StorageService,
    },
    {
      provide: ImageProcessorToken,
      useClass: SharpImageProcessor,
    },
  ],
})
export class AppModule {}
