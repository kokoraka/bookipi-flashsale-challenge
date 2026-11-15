import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order_item.model.js';
import { EpochMillisecondsTransformer } from './type.js';

@Entity({
  name: 'orders',
})
export class Order {
  @PrimaryGeneratedColumn({
    name: 'id',
    unsigned: true
  })
  id: string;

  @Column({
    name: 'unique_id',
    unique: true,
  })
  unique_id: string;

  @Column({
    name: 'idempotency_key',
    unique: true,
  })
  idempotency_key: string;

  @Column({
    name: 'buyer_name',
  })
  buyer_name: string;

  @Column({
    name: 'buyer_email',
  })
  buyer_email: string;

  @Column({
    name: 'buyer_snapshot',
    type: 'json',
    nullable: true,
    default: null,
  })
  buyer_snapshot?: Record<string, unknown>;

  @Column({
    name: 'status',
  })
  status?: string;

  @Column({
    name: 'grand_total',
  })
  grand_total: number;

  @Column({
    type: 'bigint',
    name: 'placed_at',
    transformer: EpochMillisecondsTransformer,
  })
  placed_at: Date;

  @Column({
    type: 'bigint',
    name: 'created_at',
    transformer: EpochMillisecondsTransformer,
  })
  created_at: Date;

  @Column({
    type: 'bigint',
    name: 'updated_at',
    transformer: EpochMillisecondsTransformer,
    nullable: true,
  })
  updated_at: Date;

  @OneToMany('OrderItem', 'order')
  items: OrderItem[]
}
