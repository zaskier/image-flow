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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ImageService } from "../../application/services/image.service";
import { CreateImageDto } from "./dtos/create-image.dto";
import { UpdateImageDto } from "./dtos/update-image.dto";
import { GetImagesDto } from "./dtos/get-images.dto";
import { LoggerService, loggerStorage } from "@common/logger/logger.service";

@ApiTags("images")
@Controller("images")
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ImageController.name);
  }

  @Post()
  @ApiOperation({ summary: "Upload a new image" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "Image successfully uploaded and created" })
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @UploadedFile() file: Express.MulterS3.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    const correlationId = file.key;
    return loggerStorage.run({ correlationId }, async () => {
      this.logger.log(`Item pushed: ${correlationId} with title: ${createImageDto.title}`);
      return this.imageService.create(createImageDto, file);
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update image metadata or status" })
  @ApiResponse({ status: 200, description: "Image successfully updated" })
  async updateImage(@Param("id") id: string, @Body() updateImageDto: UpdateImageDto) {
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
