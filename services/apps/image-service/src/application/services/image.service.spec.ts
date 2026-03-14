import { Test, TestingModule } from "@nestjs/testing";
import { ImageService } from "./image.service";
import { ImageRepositoryToken } from "../ports/image.repository";
import { ImageStatus } from "@common/enums/image-status.enum";
import { LoggerService } from "@common/logger/logger.service";
import { RABBITMQ_SERVICE } from "@common/constants/rabbitmq.constants";

describe("ImageService", () => {
  let service: ImageService;
  let repository: any;
  let client: any;

  beforeEach(async () => {
    repository = {
      save: jest.fn().mockImplementation((image) => Promise.resolve({ id: "1", ...image })),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    client = {
      emit: jest.fn(),
    };

    const mockLogger = {
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
          useValue: mockLogger,
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
      const dto = { title: "Test Image", width: 800, height: 600 };
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
  });
});
