import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateImageDto {
  @ApiProperty({ type: "string", format: "binary", description: "The image file to upload" })
  file: any;

  @ApiProperty({ description: "Title of the image" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Target width for resizing", example: 800 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ description: "Target height for resizing", example: 600 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height: number;
}
