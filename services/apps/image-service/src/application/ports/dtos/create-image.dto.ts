import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { MAX_WIDTH, MAX_HEIGHT, IMAGE_EXTENSIONS } from "@common/index";

export class CreateImageDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: `The image file to upload. Allowed formats: ${IMAGE_EXTENSIONS.join(", ")}`,
  })
  file: any;

  @ApiProperty({ description: "Title of the image" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: `Target width for resizing. Maximum allowed: ${MAX_WIDTH}px.`,
    example: 800,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_WIDTH)
  width: number;

  @ApiProperty({
    description: `Target height for resizing. Maximum allowed: ${MAX_HEIGHT}px.`,
    example: 600,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_HEIGHT)
  height: number;
}
