import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderItemsTable1794706094656 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`order_items\`(
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, 
        \`unique_id\` VARCHAR(36) NOT NULL, 
        \`order_id\` BIGINT UNSIGNED NOT NULL, 
        \`name\` VARCHAR(128) NOT NULL, 
        \`description\` TEXT NULL DEFAULT NULL, 
        \`quantity\` DECIMAL(20, 8) NOT NULL,
        \`unit_price\` DECIMAL(24, 8) NOT NULL,
        \`product_id\` BIGINT UNSIGNED NOT NULL, 
        \`product_snapshot\` JSON NULL DEFAULT NULL,
        \`created_at\` BIGINT NOT NULL,
        \`updated_at\` BIGINT NULL DEFAULT NULL, 
        PRIMARY KEY(\`id\`), 
        UNIQUE(\`unique_id\`),
        CONSTRAINT \`fk_order_items_order_id\`
          FOREIGN KEY (\`order_id\`)
          REFERENCES \`orders\` (\`id\`)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fk_order_items_product_id\`
          FOREIGN KEY (\`product_id\`)
          REFERENCES \`products\` (\`id\`)
          ON DELETE RESTRICT ON UPDATE CASCADE)
        ENGINE = InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`order_items\``);
  }

}
