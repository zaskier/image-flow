import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Image } from "../../domain/entities/image.entity";
import { ImageRepository } from "../../application/ports/image.repository";
import { ImageStatus } from "@common/enums/image-status.enum";

@Injectable()
export class TypeOrmImageRepository implements ImageRepository {
  constructor(
    @InjectRepository(Image)
    private readonly repository: Repository<Image>,
  ) {}

  async save(image: Partial<Image>): Promise<Image> {
    return this.repository.save(image);
  }

  async findById(id: string): Promise<Image | null> {
    return this.repository.findOneBy({ id });
  }

  async findByKey(key: string): Promise<Image | null> {
    return this.repository.findOneBy({ original_s3_key: key });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ items: Image[] }> {
    const page = options?.page ?? 1;
    const limit = Math.min(options?.limit ?? 20, 200);
    const skip = (page - 1) * limit;

    const query = this.repository.createQueryBuilder("image");

    const items = await query
      .orderBy("image.updated_at", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return { items };
  }

  async findStuckImages(olderThan: Date): Promise<Image[]> {
    return this.repository.find({
      where: [
        { status: ImageStatus.PENDING, updated_at: LessThan(olderThan) },
        { status: ImageStatus.UPLOADED, updated_at: LessThan(olderThan) },
        { status: ImageStatus.PROCESSING, updated_at: LessThan(olderThan) },
      ],
    });
  }
}
