import { Test, TestingModule } from "@nestjs/testing";
import { ImageService } from "./image.service";
import { ImageRepositoryToken } from "../ports/image.repository";
import { ImageStatus } from "@common/enums/image-status.enum";

describe("ImageService", () => {
  let service: ImageService;
  let repository: any;

  beforeEach(async () => {
    repository = {
      save: jest.fn().mockImplementation((image) => Promise.resolve({ id: "1", ...image })),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ImageRepositoryToken,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new image record", async () => {
      const title = "Test Image";
      const file = { key: "original-key" } as any;
      const result = await service.create(title, file);

      expect(repository.save).toHaveBeenCalledWith({
        title,
        original_s3_key: "original-key",
        status: ImageStatus.PENDING,
        attempts: 0,
      });
      expect(result).toHaveProperty("id", "1");
      expect(result.status).toBe(ImageStatus.PENDING);
    });
  });
});
