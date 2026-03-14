import { Body, Controller, Post } from "@nestjs/common";
import { ImageProcessorService } from "../../application/services/image-processor.service";
import { LoggerService, loggerStorage } from "@common/logger/logger.service";

@Controller("webhooks")
export class WebhookController {
  constructor(
    private readonly processorService: ImageProcessorService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(WebhookController.name);
  }

  @Post("minio")
  async handleMinioEvent(@Body() event: any) {
    const correlationId = event.Records?.[0]?.s3?.object?.key
      ? decodeURIComponent(event.Records[0].s3.object.key)
      : "unknown";

    return loggerStorage.run({ correlationId }, async () => {
      this.logger.log(`Received MinIO event for key: ${correlationId}`);
      return this.processorService.processWebhook(event);
    });
  }
}
