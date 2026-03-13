import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ImageService } from "../../application/services/image.service";
import { CreateImageDto } from "./dtos/create-image.dto";
import { UpdateImageDto } from "./dtos/update-image.dto";

@ApiTags("images")
@Controller("images")
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @ApiOperation({ summary: "Upload a new image" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "Image successfully uploaded and created" })
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @UploadedFile() file: Express.MulterS3.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imageService.create(createImageDto.title, file);
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
}
