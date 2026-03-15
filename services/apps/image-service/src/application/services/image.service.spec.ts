import { Test, TestingModule } from "@nestjs/testing";
import { ImageService } from "./image.service";
import { ImageRepositoryToken } from "../ports/image.repository";
import { ImageStatus } from "@common/enums/image-status.enum";
import { LoggerService } from "@common/logger/logger.service";
import { RABBITMQ_SERVICE } from "@common/constants/rabbitmq.constants";
import { S3Service } from "@common/s3/s3.service";

describe("ImageService", () => {
  let service: ImageService;
  let repository: any;
  let client: any;
  let s3Service: any;
  let logger: any;

  beforeEach(async () => {
    repository = {
      save: jest.fn().mockImplementation((image) => Promise.resolve({ id: "1", ...image })),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    client = {
      emit: jest.fn(),
    };

    s3Service = {
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };

    logger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ImageRepositoryToken,
          useValue: repository,
        },
        {
          provide: RABBITMQ_SERVICE,
          useValue: client,
        },
        {
          provide: LoggerService,
          useValue: logger,
        },
        {
          provide: S3Service,
          useValue: s3Service,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new image record and emit a message", async () => {
      const dto = { title: "Test Image", width: 800, height: 600, file: {} as any };
      const file = { key: "original-key" } as any;
      const result = await service.create(dto, file);

      expect(repository.save).toHaveBeenCalledWith({
        title: dto.title,
        original_s3_key: "original-key",
        status: ImageStatus.PENDING,
        width: 800,
        height: 600,
        attempts: 0,
      });
      expect(client.emit).toHaveBeenCalledWith("image_uploaded", {
        id: "1",
        key: "original-key",
        width: 800,
        height: 600,
      });
      expect(result).toHaveProperty("id", "1");
      expect(result.status).toBe(ImageStatus.PENDING);
    });

    it("should rollback S3 upload when database save fails", async () => {
      const dto = { title: "Test Image", width: 800, height: 600, file: {} as any };
      const file = { key: "original-key" } as any;
      const dbError = new Error("DB Save Failed");
      repository.save.mockRejectedValueOnce(dbError);

      await expect(service.create(dto, file)).rejects.toThrow(dbError);

      expect(s3Service.deleteFile).toHaveBeenCalledWith("original-key");
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Failed to save image metadata"));
    });

    it("should handle rollback failure when S3 deletion fails during rollback", async () => {
      const dto = { title: "Test Image", width: 800, height: 600, file: {} as any };
      const file = { key: "original-key" } as any;
      const dbError = new Error("DB Save Failed");
      const s3Error = new Error("S3 Delete Failed");
      
      repository.save.mockRejectedValueOnce(dbError);
      s3Service.deleteFile.mockRejectedValueOnce(s3Error);

      await expect(service.create(dto, file)).rejects.toThrow(dbError);

      expect(s3Service.deleteFile).toHaveBeenCalledWith("original-key");
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Failed to rollback S3 upload"));
    });
  });
});
