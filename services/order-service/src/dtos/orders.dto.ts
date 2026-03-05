import { IsString, MinLength, IsArray, ValidateNested } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  userId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  items!: Array<OrderItemDto>;
}

export class OrderItemDto {
  productId!: string;
  quantity!: number;
  price!: number;
}
