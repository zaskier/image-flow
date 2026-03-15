import { Injectable, BadRequestException } from "@nestjs/common";
import { MulterOptionsFactory, MulterModuleOptions } from "@nestjs/platform-express";
import { S3Service } from "@common/s3/s3.service";
import { IMAGE_EXTENSIONS } from "@common/index";
import multerS3 from "multer-s3";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(private readonly s3Service: S3Service) {}

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multerS3({
        s3: this.s3Service.getS3Client(),
        bucket: this.s3Service.getBucketName(),
        key: (req, file, cb) => {
          const fileName = `${Date.now()}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const extension = file.originalname.split(".").pop()?.toLowerCase();
        if (!extension || !IMAGE_EXTENSIONS.includes(extension)) {
          return cb(
            new BadRequestException(
              `Invalid file format. Allowed formats: ${IMAGE_EXTENSIONS.join(", ")}`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    };
  }
}
