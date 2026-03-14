import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
  ImageApiService,
  ImageResponse,
  UpdateImagePayload,
} from "../../application/ports/image-api.service";

@Injectable()
export class HttpImageApiService implements ImageApiService {
  private readonly logger = new Logger(HttpImageApiService.name);
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.IMAGE_SERVICE_URL || "http://image-service:3005";
  }

  async updateImage(id: string, payload: UpdateImagePayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/images/${id}`, payload),
      );
    } catch (error) {
      this.logger.error(
        `Failed to update image ${id} in image-service`,
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
        ),
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(
        `Failed to find image by key ${key} in image-service`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<ImageResponse | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ImageResponse>(`${this.baseUrl}/images/${id}`),
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(
        `Failed to find image by ID ${id} in image-service`,
        error.stack,
      );
      throw error;
    }
  }
}
