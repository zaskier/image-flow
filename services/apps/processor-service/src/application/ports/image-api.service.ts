import { ImageStatus } from "@common/enums/image-status.enum";

export interface UpdateImagePayload {
  status?: ImageStatus;
  processed_s3_key?: string;
  width?: number;
  height?: number;
  attempts?: number;
}

export interface ImageApiService {
  updateImage(id: string, payload: UpdateImagePayload): Promise<void>;
}

export const ImageApiServiceToken = Symbol("ImageApiService");
