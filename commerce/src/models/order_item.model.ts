import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { EpochMillisecondsTransformer } from './type.js';
import type { Order } from './order.model.js';

@Entity({
  name: 'order_items',
})
export class OrderItem {
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
    name: 'name',
  })
  name: string;

  @Column({
    name: 'description',
    nullable: true,
  })
  description?: string;

  @Column({
    name: 'quantity',
  })
  quantity: number;

  @Column({
    name: 'unit_price',
  })
  unit_price: number;

  @Column({
    name: 'product_snapshot',
    type: 'json',
    nullable: true,
    default: null,
  })
  product_snapshot?: unknown;

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

  @Column({
    name: 'order_id',
    type: 'bigint',
    unsigned: true,
  })
  order_id: string;

  @Column({
    name: 'product_id',
    type: 'bigint',
    unsigned: true,
  })
  product_id: string;

  @ManyToOne('Order', 'items')
  @JoinColumn({
    name: 'order_id',
    referencedColumnName: 'id',
  })
  order: Relation<Order>;
}
