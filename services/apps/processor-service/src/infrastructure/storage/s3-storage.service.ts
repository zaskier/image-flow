import { Injectable, Logger } from "@nestjs/common";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { StorageService } from "../../application/ports/storage.service";
import { Readable } from "stream";

@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);
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

  async download(bucket: string, key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      if (error instanceof NoSuchKey) {
        this.logger.error(`File not found: ${bucket}/${key}`);
      }
      throw error;
    }
  }

  async upload(bucket: string, key: string, buffer: Buffer, contentType?: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });
      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Failed to upload file to ${bucket}/${key}`, error.stack);
      throw error;
    }
  }
}
