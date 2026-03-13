import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Image } from "../../domain/entities/image.entity";
import { ImageRepository } from "../../application/ports/image.repository";

@Injectable()
export class TypeOrmImageRepository implements ImageRepository {
  constructor(
    @InjectRepository(Image)
    private readonly repository: Repository<Image>,
  ) {}

  async save(image: Partial<Image>): Promise<Image> {
    const entity = this.repository.create(image);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<Image | null> {
    return this.repository.findOneBy({ id });
  }

  async findAll(options?: { title?: string }): Promise<Image[]> {
    const query = this.repository.createQueryBuilder("image");
    if (options?.title) {
      query.andWhere("image.title LIKE :title", { title: `%${options.title}%` });
    }
    return query.getMany();
  }
}
