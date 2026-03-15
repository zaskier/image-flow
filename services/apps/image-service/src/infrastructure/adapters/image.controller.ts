import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { ImageService } from "../../application/services/image.service";
import { CreateImageDto } from "../../application/ports/dtos/create-image.dto";
import { UpdateImageDto } from "../../application/ports/dtos/update-image.dto";
import { GetImagesDto } from "../../application/ports/dtos/get-images.dto";
import { LoggerService, loggerStorage } from "@common/logger/logger.service";

@ApiTags("images")
@Controller("images")
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.logger.setContext(ImageController.name);
  }

  @Post()
  @ApiOperation({ summary: "Upload a new image" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 201,
    description: "Image successfully uploaded and created",
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @UploadedFile() file: Express.MulterS3.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    const correlationId = file.key;
    return loggerStorage.run({ correlationId }, async () => {
      this.logger.log(
        `Item pushed: ${correlationId} with title: ${createImageDto.title}`,
      );
      return this.imageService.create(createImageDto, file);
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update image metadata or status" })
  @ApiResponse({ status: 200, description: "Image successfully updated" })
  async updateImage(
    @Param("id") id: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    // Invalidate list cache on update
    await this.cacheManager.del("images_list_page_1_limit_10");
    await this.cacheManager.del("images_list_page_1_limit_20");
    await this.cacheManager.del("images_list_page_2_limit_10");
    await this.cacheManager.del("images_list_page_2_limit_20");
    return this.imageService.update(id, updateImageDto);
  }

  @Get("by-key/:key")
  @ApiOperation({ summary: "Find image by original S3 key" })
  @ApiResponse({ status: 200, description: "Image found" })
  async findByKey(@Param("key") key: string) {
    return this.imageService.findByKey(key);
  }

  @Get()
  @ApiOperation({ summary: "Get paginated list of images" })
  @ApiResponse({ status: 200, description: "List of images" })
  async findAll(@Query() query: GetImagesDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    // Only cache page 1 and 2
    if (page === 1 || page === 2) {
      const cacheKey = `images_list_page_${page}_limit_${limit}`;
      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        this.logger.log(`Returning cached results for page ${page}`);
        return cachedData;
      }

      const result = await this.imageService.findAll(query);
      await this.cacheManager.set(cacheKey, result, 60000); // 60s TTL
      return result;
    }

    return this.imageService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get image by ID" })
  @ApiResponse({ status: 200, description: "Image details" })
  @ApiResponse({ status: 404, description: "Image not found" })
  async findOne(@Param("id") id: string) {
    const image = await this.imageService.findById(id);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }
}
