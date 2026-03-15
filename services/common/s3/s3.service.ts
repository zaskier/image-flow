import { Injectable } from "@nestjs/common";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
    const endpoint = process.env.MINIO_ENDPOINT;
    const port = process.env.MINIO_PORT;

    this.s3Client = new S3Client({
      endpoint: `${protocol}://${endpoint}:${port}`,
      region: process.env.MINIO_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
      },
      forcePathStyle: true,
    });
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  getBucketName(): string {
    return process.env.MINIO_BUCKET || "images";
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });
    await this.s3Client.send(command);
  }
}
