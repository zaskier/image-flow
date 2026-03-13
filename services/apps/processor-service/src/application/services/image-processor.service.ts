import { Inject, Injectable, Logger } from "@nestjs/common";
import { ImageApiServiceToken } from "../ports/image-api.service";
import type { ImageApiService } from "../ports/image-api.service";
import { ImageStatus } from "@common/enums/image-status.enum";

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  constructor(
    @Inject(ImageApiServiceToken)
    private readonly imageApiService: ImageApiService,
  ) {}

  async processWebhook(event: any): Promise<void> {
    this.logger.log(`Received MinIO event: ${JSON.stringify(event)}`);

    try {
      const records = event.Records || [];
      for (const record of records) {
        const s3Key = record.s3.object.key;
        // In this implementation, the image ID is the UUID part of the filename if possible,
        // or we use the s3Key to look up the image.
        // Assuming metadata (like ID) is passed in the event or we need to extract it.
        // For now, let's assume we can find the image by key or the ID is somehow available.
        // We'll refine this in the parsing task.
      }
    } catch (error) {
      this.logger.error("Error processing webhook", error.stack);
    }
  }

  async updateStatus(id: string, status: ImageStatus): Promise<void> {
    await this.imageApiService.updateImage(id, { status });
  }
}
