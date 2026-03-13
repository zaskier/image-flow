import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateImageDto {
  @ApiProperty({ type: "string", format: "binary", description: "The image file to upload" })
  file: any;

  @ApiProperty({ description: "Title of the image" })
  @IsString()
  @IsNotEmpty()
  title: string;
}
