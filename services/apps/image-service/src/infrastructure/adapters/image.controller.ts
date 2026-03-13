import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ImageService } from "../../application/services/image.service";
import { CreateImageDto } from "./dtos/create-image.dto";

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
}
