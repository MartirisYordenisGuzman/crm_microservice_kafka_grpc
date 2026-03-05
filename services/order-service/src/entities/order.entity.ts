import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column("jsonb")
  items!: Array<OrderItem>;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}
