import { Injectable, Logger } from "@nestjs/common";
import {
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { StorageService } from "../../application/ports/storage.service";
import { Readable } from "stream";
import { S3Service } from "@common/s3/s3.service";

@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);

  constructor(private readonly s3Service: S3Service) {}

  async download(bucket: string, key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await this.s3Service.getS3Client().send(command);
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

  async upload(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType?: string,
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });
      await this.s3Service.getS3Client().send(command);
    } catch (error) {
      this.logger.error(
        `Failed to upload file to ${bucket}/${key}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw error;
    }
  }
}
