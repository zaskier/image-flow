import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ImageStatus } from "@common/enums/image-status.enum";

export class UpdateImageDto {
  @ApiProperty({ enum: ImageStatus, required: false })
  @IsEnum(ImageStatus)
  @IsOptional()
  status?: ImageStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  processed_s3_key?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  attempts?: number;
}
