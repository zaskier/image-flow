import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ImageProcessorService } from "../../application/services/image-processor.service";
import { LoggerService, loggerStorage } from "@common/logger/logger.service";
import * as os from "os";

@Controller()
export class MessagingController {
  private readonly hostname: string;

  constructor(
    private readonly imageProcessorService: ImageProcessorService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MessagingController.name);
    this.hostname = os.hostname();
  }

  @EventPattern("image_uploaded")
  async handleImageUploaded(
    @Payload()
    data: {
      id: string;
      key: string;
      width?: number;
      height?: number;
    },
  ) {
    return loggerStorage.run({ correlationId: data.id }, async () => {
      this.logger.log(
        `[${this.hostname}] Received image_uploaded event for ID: ${data.id}`,
      );
      await this.imageProcessorService.processImageTask(data);
    });
  }
}
