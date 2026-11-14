import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1794632970247 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`products\`(
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, 
        \`unique_id\` VARCHAR(32) NOT NULL, 
        \`name\` VARCHAR(128) NOT NULL, 
        \`description\` TEXT NULL DEFAULT NULL, 
        \`thumbnail\` JSON NULL DEFAULT NULL,
        \`selling_price\` DECIMAL(24, 8) NOT NULL,
        \`created_at\` BIGINT NOT NULL, 
        \`updated_at\` BIGINT NULL DEFAULT NULL, 
        PRIMARY KEY(\`id\`), UNIQUE(\`unique_id\`)) 
        ENGINE = InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`products\``);
  }

}
