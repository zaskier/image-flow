import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class S3ConfigService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: `http://${this.configService.get<string>("MINIO_ENDPOINT")}:${this.configService.get<string>("MINIO_PORT")}`,
      region: this.configService.get<string>("MINIO_REGION", "us-east-1"),
      credentials: {
        accessKeyId: this.configService.get<string>("MINIO_ACCESS_KEY", "minioadmin"),
        secretAccessKey: this.configService.get<string>("MINIO_SECRET_KEY", "minioadmin"),
      },
      forcePathStyle: true,
    });
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  getBucketName(): string {
    return this.configService.get<string>("MINIO_BUCKET", "images");
  }
}
