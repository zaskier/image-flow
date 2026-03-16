import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule as ProcessorModule } from "../../src/app.module";
import { ImageProcessorService } from "../../src/application/services/image-processor.service";
import { MessagingController } from "../../src/infrastructure/adapters/messaging.controller";
import { ImageStatus } from "@common/enums/image-status.enum";

describe("RabbitMQ Consumption (ProcessorService Integration)", () => {
  let processorApp: INestApplication;
  let imageProcessorService: ImageProcessorService;
  let messagingController: MessagingController;

  beforeEach(async () => {
    const processorModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProcessorModule],
    })
    .overrideProvider(ImageProcessorService)
    .useValue({
      processImageTask: jest.fn().mockResolvedValue(undefined),
    })
    .compile();

    processorApp = processorModuleFixture.createNestApplication();
    await processorApp.init();

    imageProcessorService = processorApp.get<ImageProcessorService>(ImageProcessorService);
    messagingController = processorApp.get<MessagingController>(MessagingController);
  });

  afterEach(async () => {
    await processorApp.close();
  });

  it("should correctly handle 'image_uploaded' event structure as emitted by ImageService", async () => {
    const payload = {
      id: "test-uuid-123",
      key: "raw/test-image.jpg",
      width: 1024,
      height: 768,
    };

    await messagingController.handleImageUploaded(payload);

    expect(imageProcessorService.processImageTask).toHaveBeenCalledWith(expect.objectContaining({
      id: "test-uuid-123",
      key: "raw/test-image.jpg",
      width: 1024,
      height: 768,
    }));
  });

  it("should handle payload with missing optional dimensions", async () => {
    const payload = {
      id: "test-uuid-456",
      key: "raw/test-no-dims.jpg",
    };

    await messagingController.handleImageUploaded(payload);

    expect(imageProcessorService.processImageTask).toHaveBeenCalledWith(expect.objectContaining({
      id: "test-uuid-456",
      key: "raw/test-no-dims.jpg",
    }));
  });

  it("should propagate errors from service to trigger RabbitMQ retry (NACK)", async () => {
    const payload = { id: "error-id", key: "error-key" };
    const error = new Error("Processing failed catastrophically");

    // Mock the service to throw an error
    jest.spyOn(imageProcessorService, 'processImageTask').mockRejectedValueOnce(error);

    // When the controller handles the message, it should throw (or rethrow) 
    // so that NestJS/RabbitMQ can handle the NACK/Retry logic.
    await expect(messagingController.handleImageUploaded(payload)).rejects.toThrow(error);
  });
});

