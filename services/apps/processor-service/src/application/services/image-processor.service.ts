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
        const s3Key = decodeURIComponent(record.s3.object.key);
        this.logger.log(`Processing image with key: ${s3Key}`);

        // Find the image record in image-service
        const image = await this.imageApiService.findByKey(s3Key);
        if (!image) {
          this.logger.warn(`Image with key ${s3Key} not found in database. Skipping.`);
          continue;
        }

        // Update status to UPLOADED
        await this.imageApiService.updateImage(image.id, { status: ImageStatus.UPLOADED });
        this.logger.log(`Image ${image.id} status updated to UPLOADED`);

        // Trigger further processing (resizing) - to be implemented in Task 4+
        // await this.processImage(image);
      }
    } catch (error) {
      this.logger.error("Error processing webhook", error.stack);
    }
  }

  async updateStatus(id: string, status: ImageStatus): Promise<void> {
    await this.imageApiService.updateImage(id, { status });
  }
}
