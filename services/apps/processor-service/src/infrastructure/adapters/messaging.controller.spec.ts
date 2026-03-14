import { Test, TestingModule } from "@nestjs/testing";
import { MessagingController } from "./messaging.controller";
import { ImageProcessorService } from "../../application/services/image-processor.service";
import { LoggerService } from "@common/logger/logger.service";

describe("MessagingController", () => {
  let controller: MessagingController;
  let service: ImageProcessorService;

  beforeEach(async () => {
    const mockService = {
      processImageTask: jest.fn(),
    };

    const mockLogger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [
        {
          provide: ImageProcessorService,
          useValue: mockService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<MessagingController>(MessagingController);
    service = module.get<ImageProcessorService>(ImageProcessorService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("handleImageUploaded", () => {
    it("should call processImageTask with payload", async () => {
      const payload = { id: "1", key: "test.jpg", width: 800 };
      await controller.handleImageUploaded(payload);

      expect(service.processImageTask).toHaveBeenCalledWith(payload);
    });
  });
});
