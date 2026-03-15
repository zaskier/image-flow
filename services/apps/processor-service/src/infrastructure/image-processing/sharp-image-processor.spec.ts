import { Test, TestingModule } from "@nestjs/testing";
import { SharpImageProcessor } from "./sharp-image-processor";
import sharp from "sharp";
import { MAX_WIDTH } from "@common/index";
import { BadRequestException } from "@nestjs/common";

describe("SharpImageProcessor", () => {
  let processor: SharpImageProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharpImageProcessor],
    }).compile();

    processor = module.get<SharpImageProcessor>(SharpImageProcessor);
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });

  it("should resize image to fill requested dimensions", async () => {
    const buffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const { dimensions } = await processor.resize(buffer, 50, 80);
    expect(dimensions.width).toBe(50);
    expect(dimensions.height).toBe(80);
  });

  it("should throw processing exception if image is exceeding resizing limits", async () => {
    const buffer = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    await expect(processor.resize(buffer, MAX_WIDTH + 1, 10)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should not process non image files", async () => {
    const buffer = Buffer.from("not an image");
    await expect(processor.resize(buffer, 10, 10)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should use PNG compression for PNG images", async () => {
    const buffer = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    const { buffer: resultBuffer } = await processor.resize(buffer, 5, 5);
    const metadata = await sharp(resultBuffer).metadata();
    expect(metadata.format).toBe("png");
  });

  it("should use JPEG compression for non-PNG images", async () => {
    const buffer = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    const { buffer: resultBuffer } = await processor.resize(buffer, 5, 5);
    const metadata = await sharp(resultBuffer).metadata();
    expect(metadata.format).toBe("jpeg");
  });
});
