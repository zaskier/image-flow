import { Test, TestingModule } from "@nestjs/testing";
import { ImageController } from "./image.controller";
import { ImageService } from "../../application/services/image.service";
import { ImageStatus } from "@common/enums/image-status.enum";

describe("ImageController", () => {
  let controller: ImageController;
  let service: ImageService;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByKey: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    service = module.get<ImageService>(ImageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated images", async () => {
      const result = { items: [], total: 0 };
      jest.spyOn(service, "findAll").mockResolvedValue(result);

      expect(await controller.findAll({ page: 1, limit: 10 })).toBe(result);
    });
  });

  describe("updateImage", () => {
    it("should update image status", async () => {
      const id = "test-uuid";
      const updateData = { status: ImageStatus.READY };
      const updatedImage = { id, ...updateData };
      jest.spyOn(service, "update").mockResolvedValue(updatedImage as any);

      expect(await controller.updateImage(id, updateData)).toBe(updatedImage);
    });
  });
});
