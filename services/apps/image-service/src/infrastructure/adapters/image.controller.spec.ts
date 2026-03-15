/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ImageController } from "./image.controller";
import { ImageService } from "../../application/services/image.service";
import { ImageStatus } from "@common/enums/image-status.enum";
import { LoggerService } from "@common/logger/logger.service";

describe("ImageController", () => {
  let controller: ImageController;
  let service: ImageService;
  let cacheManager: any;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByKey: jest.fn(),
      findAll: jest.fn(),
    };

    const mockLogger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: mockService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCache,
        },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    service = module.get<ImageService>(ImageService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated images and cache them for page 1", async () => {
      const result = { items: [], total: 0 } as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(service, "findAll").mockResolvedValue(result);

      jest.spyOn(cacheManager, "get").mockResolvedValue(null);

      const response = await controller.findAll({ page: 1, limit: 10 });

      expect(response).toBe(result);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(cacheManager.get).toHaveBeenCalledWith(
        "images_list_page_1_limit_10",
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(cacheManager.set).toHaveBeenCalledWith(
        "images_list_page_1_limit_10",
        result,
        60000,
      );
    });

    it("should return cached results if available for page 1", async () => {
      const cachedResult = { items: [{ id: "cached" }], total: 1 } as any;

      jest.spyOn(cacheManager, "get").mockResolvedValue(cachedResult);

      const response = await controller.findAll({ page: 1, limit: 10 });

      expect(response).toBe(cachedResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it("should not cache results for page 3", async () => {
      const result = { items: [], total: 0 } as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(service, "findAll").mockResolvedValue(result);

      const response = await controller.findAll({ page: 3, limit: 10 });

      expect(response).toBe(result);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(cacheManager.get).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe("updateImage", () => {
    it("should update image status and invalidate cache", async () => {
      const id = "test-uuid";
      const updateData = { status: ImageStatus.READY };
      const updatedImage = { id, ...updateData };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(service, "update").mockResolvedValue(updatedImage as any);

      const response = await controller.updateImage(id, updateData);

      expect(response).toBe(updatedImage);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(cacheManager.del).toHaveBeenCalledWith(
        "images_list_page_1_limit_10",
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(cacheManager.del).toHaveBeenCalledWith(
        "images_list_page_2_limit_10",
      );
    });
  });
});
