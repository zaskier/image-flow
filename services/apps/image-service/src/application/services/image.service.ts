import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ImageRepositoryToken } from "../ports/image.repository";
import type { ImageRepository } from "../ports/image.repository";
import type { Image } from "../../domain/entities/image.entity";
import { ImageStatus } from "@common/enums/image-status.enum";
import type { UploadedFile } from "../ports/uploaded-file.interface";
import { LoggerService } from "@common/logger/logger.service";
import { CreateImageDto } from "../../infrastructure/adapters/dtos/create-image.dto";
import { RABBITMQ_SERVICE } from "@common/constants/rabbitmq.constants";

@Injectable()
export class ImageService {
  constructor(
    @Inject(ImageRepositoryToken)
    private readonly imageRepository: ImageRepository,
    @Inject(RABBITMQ_SERVICE)
    private readonly client: ClientProxy,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ImageService.name);
  }

  async create(createImageDto: CreateImageDto, file: UploadedFile): Promise<Image> {
    const image: Partial<Image> = {
      title: createImageDto.title,
      original_s3_key: file.key,
      status: ImageStatus.PENDING,
      width: createImageDto.width,
      height: createImageDto.height,
      attempts: 0,
    };
    const savedImage = await this.imageRepository.save(image);

    this.logger.log(`Publishing image processing task for key: ${file.key}`);
    this.client.emit("image_uploaded", {
      id: savedImage.id,
      key: file.key,
      width: createImageDto.width,
      height: createImageDto.height,
    });

    return savedImage;
  }

  async update(id: string, updateData: Partial<Image>): Promise<Image> {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    this.logger.log(`Updating image ${id} with status: ${updateData.status}`);
    return this.imageRepository.save({ ...image, ...updateData });
  }

  async findById(id: string): Promise<Image | null> {
    return this.imageRepository.findById(id);
  }

  async findByKey(key: string): Promise<Image | null> {
    return this.imageRepository.findByKey(key);
  }

  async findAll(options?: {
    title?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Image[]; total: number }> {
    return this.imageRepository.findAll(options);
  }
}
