export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageProcessor {
  resize(
    buffer: Buffer,
    width?: number,
    height?: number,
  ): Promise<{ buffer: Buffer; dimensions: ImageDimensions }>;
}

export const ImageProcessorToken = Symbol("ImageProcessor");
