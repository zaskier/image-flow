import { Test, TestingModule } from "@nestjs/testing";
import { ImageProcessorService } from "./image-processor.service";
import { ImageApiServiceToken, ImageResponse } from "../ports/image-api.service";
import { StorageServiceToken } from "../ports/storage.service";
import { ImageProcessorToken } from "../ports/image-processor";
import { LoggerService } from "@common/logger/logger.service";
import { ImageStatus } from "@common/enums/image-status.enum";
import { MinioEvent } from "../ports/minio-event";

describe("ImageProcessorService", () => {
  let service: ImageProcessorService;
  let imageApiService: any;
  let storageService: any;
  let imageProcessor: any;
  let logger: any;

  const mockImage: ImageResponse = {
    id: "uuid-1",
    title: "Test Image",
    original_s3_key: "raw/test.jpg",
    status: ImageStatus.PENDING,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    imageApiService = {
      findByKey: jest.fn(),
      findById: jest.fn(),
      updateImage: jest.fn(),
    };
    storageService = {
      download: jest.fn(),
      upload: jest.fn(),
    };
    imageProcessor = {
      resize: jest.fn(),
    };
    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageProcessorService,
        { provide: ImageApiServiceToken, useValue: imageApiService },
        { provide: StorageServiceToken, useValue: storageService },
        { provide: ImageProcessorToken, useValue: imageProcessor },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get<ImageProcessorService>(ImageProcessorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("processWebhook", () => {
    it("should process images from valid MinioEvent", async () => {
      const event: MinioEvent = {
        Records: [
          {
            s3: {
              bucket: { name: "test-bucket" },
              object: { key: "raw/test.jpg" },
            },
          } as any,
        ],
      };

      imageApiService.findByKey.mockResolvedValue(mockImage);
      storageService.download.mockResolvedValue(Buffer.from("original"));
      imageProcessor.resize.mockResolvedValue({
        buffer: Buffer.from("processed"),
        dimensions: { width: 100, height: 100 },
      });

      await service.processWebhook(event);

      expect(imageApiService.findByKey).toHaveBeenCalledWith("raw/test.jpg");
      expect(imageApiService.updateImage).toHaveBeenCalledWith("uuid-1", {
        status: ImageStatus.PROCESSING,
      });
      expect(storageService.download).toHaveBeenCalledWith("test-bucket", "raw/test.jpg");
      expect(storageService.upload).toHaveBeenCalled();
      expect(imageApiService.updateImage).toHaveBeenCalledWith("uuid-1", expect.objectContaining({
        status: ImageStatus.READY,
      }));
    });

    it("should skip if image not found in database", async () => {
      const event: MinioEvent = {
        Records: [
          {
            s3: {
              bucket: { name: "test-bucket" },
              object: { key: "raw/notfound.jpg" },
            },
          } as any,
        ],
      };

      imageApiService.findByKey.mockResolvedValue(null);

      await service.processWebhook(event);

      expect(imageApiService.findByKey).toHaveBeenCalledWith("raw/notfound.jpg");
      expect(storageService.download).not.toHaveBeenCalled();
    });
  });

  describe("processImageTask", () => {
    it("should process image task by ID", async () => {
      const taskData = { id: "uuid-1", key: "raw/test.jpg", width: 100 };
      
      imageApiService.findById.mockResolvedValue(mockImage);
      storageService.download.mockResolvedValue(Buffer.from("original"));
      imageProcessor.resize.mockResolvedValue({
        buffer: Buffer.from("processed"),
        dimensions: { width: 100, height: 100 },
      });

      await service.processImageTask(taskData);

      expect(imageApiService.findById).toHaveBeenCalledWith("uuid-1");
      expect(imageProcessor.resize).toHaveBeenCalledWith(expect.anything(), 100, undefined);
      expect(imageApiService.updateImage).toHaveBeenCalledWith("uuid-1", expect.objectContaining({
        status: ImageStatus.READY,
      }));
    });

    it("should log error if image ID not found", async () => {
      imageApiService.findById.mockResolvedValue(null);

      await service.processImageTask({ id: "not-found", key: "any" });

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("not found"));
      expect(storageService.download).not.toHaveBeenCalled();
    });
  });

  describe("failure handling", () => {
    it("should set status to FAILED if processing fails", async () => {
      imageApiService.findById.mockResolvedValue(mockImage);
      storageService.download.mockRejectedValue(new Error("Download failed"));

      await service.processImageTask({ id: "uuid-1", key: "any" });

      expect(imageApiService.updateImage).toHaveBeenCalledWith("uuid-1", {
        status: ImageStatus.FAILED,
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
