import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { ImageApiService, UpdateImagePayload } from "../../application/ports/image-api.service";

@Injectable()
export class HttpImageApiService implements ImageApiService {
  private readonly logger = new Logger(HttpImageApiService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>("IMAGE_SERVICE_URL", "http://image-service:8080");
  }

  async updateImage(id: string, payload: UpdateImagePayload): Promise<void> {
    try {
      await firstValueFrom(this.httpService.patch(`${this.baseUrl}/images/${id}`, payload));
    } catch (error) {
      this.logger.error(`Failed to update image ${id} in image-service`, error.stack);
      throw error;
    }
  }
}
