import { Injectable } from "@nestjs/common";
import {
  MulterOptionsFactory,
  MulterModuleOptions,
} from "@nestjs/platform-express";
import { S3ConfigService } from "./s3-config.service";
import multerS3 from "multer-s3";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(private readonly s3ConfigService: S3ConfigService) {}

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multerS3({
        s3: this.s3ConfigService.getS3Client(),
        bucket: this.s3ConfigService.getBucketName(),
        key: (req, file, cb) => {
          const fileName = `${Date.now()}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
    };
  }
}
