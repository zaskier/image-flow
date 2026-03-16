import { Test, TestingModule } from "@nestjs/testing";
import { MulterConfigService } from "./multer-config.service";
import { S3Service } from "@common/s3/s3.service";
import { BadRequestException } from "@nestjs/common";
import { MAX_FILE_SIZE } from "@common/index";

describe("MulterConfigService", () => {
  let service: MulterConfigService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MulterConfigService,
        {
          provide: S3Service,
          useValue: {
            getS3Client: jest.fn().mockReturnValue({}),
            getBucketName: jest.fn().mockReturnValue("test-bucket"),
          },
        },
      ],
    }).compile();

    service = module.get<MulterConfigService>(MulterConfigService);
    s3Service = module.get<S3Service>(S3Service);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createMulterOptions", () => {
    it("should return correct multer options", () => {
      const options = service.createMulterOptions();

      expect(options).toBeDefined();
      expect(options.limits).toEqual({ fileSize: MAX_FILE_SIZE });
      expect(options.storage).toBeDefined();
      expect(options.fileFilter).toBeDefined();
    });

    describe("fileFilter", () => {
      it("should accept valid image extensions", () => {
        const options = service.createMulterOptions();
        const fileFilter = options.fileFilter as Function;
        const cb = jest.fn();

        fileFilter(null, { originalname: "test.jpg" }, cb);
        expect(cb).toHaveBeenCalledWith(null, true);

        fileFilter(null, { originalname: "test.png" }, cb);
        expect(cb).toHaveBeenCalledWith(null, true);

        fileFilter(null, { originalname: "test.WEBP" }, cb);
        expect(cb).toHaveBeenCalledWith(null, true);
      });

      it("should reject invalid extensions", () => {
        const options = service.createMulterOptions();
        const fileFilter = options.fileFilter as Function;
        const cb = jest.fn();

        fileFilter(null, { originalname: "test.txt" }, cb);
        expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException), false);

        fileFilter(null, { originalname: "test" }, cb);
        expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException), false);
      });
    });
  });
});
