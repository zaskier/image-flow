import { Body, Controller, Post } from "@nestjs/common";
import { ImageProcessorService } from "../../application/services/image-processor.service";

@Controller("webhooks")
export class WebhookController {
  constructor(private readonly processorService: ImageProcessorService) {}

  @Post("minio")
  async handleMinioEvent(@Body() event: any) {
    return this.processorService.processWebhook(event);
  }
}
