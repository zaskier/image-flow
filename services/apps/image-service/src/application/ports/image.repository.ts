import { Image } from "../../domain/entities/image.entity";
import { ImageStatus } from "@common/enums/image-status.enum";

export interface ImageRepository {
  save(image: Partial<Image>): Promise<Image>;
  findById(id: string): Promise<Image | null>;
  findByKey(key: string): Promise<Image | null>;
  findAll(options?: {
    title?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Image[]; total: number }>;
  findStuckImages(olderThan: Date): Promise<Image[]>;
}

export const ImageRepositoryToken = Symbol("ImageRepository");
