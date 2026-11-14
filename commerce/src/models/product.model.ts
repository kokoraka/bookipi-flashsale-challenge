import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { FileObject } from './file.model.js';
import { EpochMillisecondsTransformer } from './type.js';

@Entity({
  name: 'products',
})
export class Product {
  @PrimaryGeneratedColumn({
    name: 'id',
    unsigned: true
  })
  id: number;

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
    name: 'thumbnail',
    type: 'json',
    nullable: true,
    default: null,
  })
  thumbnail?: FileObject;

  @Column({
    name: 'selling_price',
  })
  selling_price: number;

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
}
