import { ImageStatus } from "@common/enums/image-status.enum";

export interface ImageResponse {
  id: string;
  title: string;
  original_s3_key: string;
  status: ImageStatus;
}

export interface UpdateImagePayload {
  status?: ImageStatus;
  processed_s3_key?: string;
  width?: number;
  height?: number;
  attempts?: number;
}

export interface ImageApiService {
  updateImage(id: string, payload: UpdateImagePayload): Promise<void>;
  findByKey(key: string): Promise<ImageResponse | null>;
  findById(id: string): Promise<ImageResponse | null>;
}

export const ImageApiServiceToken = Symbol("ImageApiService");
