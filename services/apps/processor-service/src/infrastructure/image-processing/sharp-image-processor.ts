import { Injectable, BadRequestException } from "@nestjs/common";
import sharp from "sharp";
import {
  ImageDimensions,
  ImageProcessor,
} from "../../application/ports/image-processor";
import { MAX_WIDTH, MAX_HEIGHT } from "@common/index";

@Injectable()
export class SharpImageProcessor implements ImageProcessor {
  async resize(
    buffer: Buffer,
    width?: number,
    height?: number,
  ): Promise<{ buffer: Buffer; dimensions: ImageDimensions }> {
    try {
      const transformer = sharp(buffer);
      const metadata = await transformer.metadata();

      if (!metadata.format) {
        throw new BadRequestException("Invalid image file");
      }

      if ((width && width > MAX_WIDTH) || (height && height > MAX_HEIGHT)) {
        throw new BadRequestException(
          `Image exceeding resizing limits: max ${MAX_WIDTH}x${MAX_HEIGHT}`,
        );
      }

      if (width || height) {
        transformer.resize(width, height, {
          fit: "fill",
          withoutEnlargement: true,
        });
      }

      // Compression logic
      if (metadata.format === "png") {
        transformer.png({ quality: 80, compressionLevel: 9 });
      } else {
        transformer.jpeg({ quality: 80 });
      }

      const { data, info } = await transformer.toBuffer({
        resolveWithObject: true,
      });

      return {
        buffer: data,
        dimensions: {
          width: info.width,
          height: info.height,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to process image: ${error.message}`,
      );
    }
  }
}
