import { Injectable } from "@nestjs/common";
import sharp from "sharp";
import { ImageDimensions, ImageProcessor } from "../../application/ports/image-processor";

@Injectable()
export class SharpImageProcessor implements ImageProcessor {
  async resize(
    buffer: Buffer,
    width?: number,
    height?: number,
  ): Promise<{ buffer: Buffer; dimensions: ImageDimensions }> {
    const transformer = sharp(buffer);

    if (width || height) {
      transformer.resize(width, height, { fit: "inside", withoutEnlargement: true });
    }

    const { data, info } = await transformer.toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      dimensions: {
        width: info.width,
        height: info.height,
      },
    };
  }
}
