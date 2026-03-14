import { Inject, Injectable } from "@nestjs/common";
import {
  ImageApiServiceToken,
  ImageResponse,
} from "../ports/image-api.service";
import type { ImageApiService } from "../ports/image-api.service";
import { ImageStatus } from "@common/enums/image-status.enum";
import { StorageServiceToken } from "../ports/storage.service";
import type { StorageService } from "../ports/storage.service";
import { ImageProcessorToken } from "../ports/image-processor";
import type { ImageProcessor } from "../ports/image-processor";
import { LoggerService } from "@common/logger/logger.service";

@Injectable()
export class ImageProcessorService {
  constructor(
    @Inject(ImageApiServiceToken)
    private readonly imageApiService: ImageApiService,
    @Inject(StorageServiceToken)
    private readonly storageService: StorageService,
    @Inject(ImageProcessorToken)
    private readonly imageProcessor: ImageProcessor,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ImageProcessorService.name);
  }

  async processWebhook(event: any): Promise<void> {
    try {
      const records = event.Records || [];
      for (const record of records) {
        const s3Key = decodeURIComponent(record.s3.object.key);
        const bucket = record.s3.bucket.name;
        this.logger.log(
          `Processing image from bucket ${bucket} with key: ${s3Key}`,
        );

        // Find the image record in image-service
        const image = await this.imageApiService.findByKey(s3Key);
        if (!image) {
          this.logger.warn(
            `Image with key ${s3Key} not found in database. Skipping.`,
          );
          continue;
        }

        // Trigger processing
        await this.processImage(image, bucket);
      }
    } catch (error) {
      this.logger.error("Error processing webhook", error.stack);
    }
  }

  async processImageTask(data: {
    id: string;
    key: string;
    width?: number;
    height?: number;
  }): Promise<void> {
    try {
      this.logger.log(`Received image processing task for ID: ${data.id}`);
      const bucket = process.env.MINIO_BUCKET || "images";

      const image = await this.imageApiService.findById(data.id);
      if (!image) {
        this.logger.error(`Image with ID ${data.id} not found`);
        return;
      }

      const targetWidth = data.width ? Number(data.width) : undefined;
      const targetHeight = data.height ? Number(data.height) : undefined;

      await this.processImage(image, bucket, targetWidth, targetHeight);
    } catch (error) {
      this.logger.error(`Error in processImageTask: ${error.message}`, error.stack);
    }
  }

  private async processImage(
    image: ImageResponse,
    bucket: string,
    targetWidth?: number,
    targetHeight?: number,
  ): Promise<void> {
    try {
      // 1. Update status to PROCESSING
      await this.imageApiService.updateImage(image.id, {
        status: ImageStatus.PROCESSING,
      });
      this.logger.log(`Image ${image.id} status updated to PROCESSING`);

      // 2. Download original image
      const originalBuffer = await this.storageService.download(
        bucket,
        image.original_s3_key,
      );

      // 3. Resize image
      this.logger.log(`Resizing image ${image.id} to ${targetWidth}x${targetHeight}`);
      const { buffer: processedBuffer, dimensions } =
        await this.imageProcessor.resize(originalBuffer, targetWidth, targetHeight);

      // 4. Upload processed image
      const processedS3Key = `processed/${image.id}-${Date.now()}.jpg`;
      await this.storageService.upload(
        bucket,
        processedS3Key,
        processedBuffer,
        "image/jpeg",
      );

      // 5. Update record with processed data and status READY
      await this.imageApiService.updateImage(image.id, {
        status: ImageStatus.READY,
        processed_s3_key: processedS3Key,
        width: dimensions.width,
        height: dimensions.height,
      });
      this.logger.log(`Image ${image.id} processed successfully: ${processedS3Key}`);
    } catch (error) {
      this.logger.error(`Failed to process image ${image.id}`, error.stack);
      await this.imageApiService.updateImage(image.id, {
        status: ImageStatus.FAILED,
      });
    }
  }

  async updateStatus(id: string, status: ImageStatus): Promise<void> {
    await this.imageApiService.updateImage(id, { status });
  }
}
