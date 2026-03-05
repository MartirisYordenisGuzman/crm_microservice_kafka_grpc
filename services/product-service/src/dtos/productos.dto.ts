import { IsString, MinLength, IsOptional, IsBoolean, IsDecimal, IsInt } from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsDecimal()
  price!: number;

  @IsInt()
  stock!: number;

  @IsString()
  @MinLength(2)
  category!: string;
}

export class UpdateProductDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @IsDecimal()
  @IsOptional()
  price?: number;

  @IsInt()
  @IsOptional()
  stock?: number;

  @IsString()
  @MinLength(2)
  @IsOptional()
  category?: string;
}
