import { Image } from "../../domain/entities/image.entity";

export interface ImageRepository {
  save(image: Partial<Image>): Promise<Image>;
  findById(id: string): Promise<Image | null>;
  findByKey(key: string): Promise<Image | null>;
  findAll(options?: { title?: string }): Promise<Image[]>;
}

export const ImageRepositoryToken = Symbol("ImageRepository");
