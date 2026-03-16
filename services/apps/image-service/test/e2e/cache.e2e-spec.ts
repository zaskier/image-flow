import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { ImageService } from "../../src/application/services/image.service";
import { ImageController } from "../../src/infrastructure/adapters/image.controller";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { LoggerService } from "@common/logger/logger.service";

describe("ImageController Caching (e2e)", () => {
  let app: INestApplication;
  let imageService: ImageService;
  let cacheStore: Map<string, any>;

  beforeEach(async () => {
    cacheStore = new Map();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({
              data: [{ id: "1", title: "Test Image" }],
              total: 1,
              page: 1,
              limit: 10,
            }),
            update: jest.fn().mockResolvedValue({ id: "1", title: "Updated" }),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            setContext: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn((key) => cacheStore.get(key)),
            set: jest.fn((key, value) => cacheStore.set(key, value)),
            del: jest.fn((key) => cacheStore.delete(key)),
            clear: jest.fn(() => cacheStore.clear()),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    imageService = moduleFixture.get<ImageService>(ImageService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/images (GET) - Caching", () => {
    it("should call ImageService on cache miss (first request)", async () => {
      await request(app.getHttpServer())
        .get("/images?page=1&limit=10")
        .expect(200);

      expect(imageService.findAll).toHaveBeenCalledTimes(1);
    });

    it("should NOT call ImageService on cache hit (second request)", async () => {
      // First request (populate cache)
      await request(app.getHttpServer())
        .get("/images?page=1&limit=10")
        .expect(200);

      // Second request (should hit cache)
      await request(app.getHttpServer())
        .get("/images?page=1&limit=10")
        .expect(200);

      expect(imageService.findAll).toHaveBeenCalledTimes(1);
    });

    it("should NOT cache pages beyond 2", async () => {
      await request(app.getHttpServer())
        .get("/images?page=3&limit=10")
        .expect(200);

      await request(app.getHttpServer())
        .get("/images?page=3&limit=10")
        .expect(200);

      expect(imageService.findAll).toHaveBeenCalledTimes(2);
    });
  });

  describe("/images/:id (PATCH) - Invalidation", () => {
    it("should invalidate cache on image update", async () => {
      // Populate cache
      await request(app.getHttpServer())
        .get("/images?page=1&limit=10")
        .expect(200);

      expect(imageService.findAll).toHaveBeenCalledTimes(1);
      expect(cacheStore.has("images_list_page_1_limit_10")).toBe(true);

      // Update image (should invalidate)
      await request(app.getHttpServer())
        .patch("/images/1")
        .send({ title: "Updated" })
        .expect(200);

      expect(cacheStore.has("images_list_page_1_limit_10")).toBe(false);

      // Next request should be a miss
      await request(app.getHttpServer())
        .get("/images?page=1&limit=10")
        .expect(200);

      expect(imageService.findAll).toHaveBeenCalledTimes(2);
    });
  });
});
