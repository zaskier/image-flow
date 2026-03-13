import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ImageRepositoryToken } from "../ports/image.repository";
import type { ImageRepository } from "../ports/image.repository";
import { ImageStatus } from "@common/enums/image-status.enum";

@Injectable()
export class JanitorService {
  private readonly logger = new Logger(JanitorService.name);

  constructor(
    @Inject(ImageRepositoryToken)
    private readonly imageRepository: ImageRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupStuckImages() {
    this.logger.log("Running Janitor job to cleanup stuck images...");

    const olderThan = new Date();
    olderThan.setMinutes(olderThan.getMinutes() - 5); // Stuck for more than 5 minutes

    try {
      const stuckImages = await this.imageRepository.findStuckImages(olderThan);

      if (stuckImages.length > 0) {
        this.logger.warn(`Found ${stuckImages.length} stuck images. Marking as FAILED.`);

        for (const image of stuckImages) {
          await this.imageRepository.save({
            ...image,
            status: ImageStatus.FAILED,
          });
          this.logger.log(`Image ${image.id} marked as FAILED by Janitor`);
        }
      } else {
        this.logger.log("No stuck images found.");
      }
    } catch (error) {
      this.logger.error("Error during Janitor cleanup job", error.stack);
    }
  }
}
