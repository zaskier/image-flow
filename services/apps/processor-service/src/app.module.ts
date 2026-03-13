import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { ImageProcessorService } from "./application/services/image-processor.service";
import { WebhookController } from "./infrastructure/adapters/webhook.controller";
import { ImageApiServiceToken } from "./application/ports/image-api.service";
import { HttpImageApiService } from "./infrastructure/adapters/http-image-api.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [WebhookController],
  providers: [
    ImageProcessorService,
    {
      provide: ImageApiServiceToken,
      useClass: HttpImageApiService,
    },
  ],
})
export class AppModule {}
