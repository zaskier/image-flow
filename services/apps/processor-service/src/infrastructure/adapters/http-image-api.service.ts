import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
  ImageApiService,
  ImageResponse,
  UpdateImagePayload,
} from "../../application/ports/image-api.service";
import { loggerStorage } from "@common/logger/logger.service";

@Injectable()
export class HttpImageApiService implements ImageApiService {
  private readonly logger = new Logger(HttpImageApiService.name);
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.IMAGE_SERVICE_URL || "http://image-service:3005";
  }

  private getHeaders() {
    const store = loggerStorage.getStore();
    return store?.correlationId
      ? { "X-Correlation-Id": store.correlationId }
      : {};
  }

  async updateImage(id: string, payload: UpdateImagePayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/images/${id}`, payload, {
          headers: this.getHeaders(),
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to update image ${id} in image-service`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw error;
    }
  }

  async findByKey(key: string): Promise<ImageResponse | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ImageResponse>(
          `${this.baseUrl}/images/by-key/${key}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );
      return data;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(
        `Failed to find image by key ${key} in image-service`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<ImageResponse | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ImageResponse>(`${this.baseUrl}/images/${id}`, {
          headers: this.getHeaders(),
        }),
      );
      return data;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(
        `Failed to find image by ID ${id} in image-service`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
      throw error;
    }
  }
}
