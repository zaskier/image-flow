import { Injectable } from "@nestjs/common";
import { MulterOptionsFactory, MulterModuleOptions } from "@nestjs/platform-express";
import { S3Service } from "@common/s3/s3.service";
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
    };
  }
}
