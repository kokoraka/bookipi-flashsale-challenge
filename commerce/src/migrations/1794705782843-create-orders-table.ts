import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrdersTable1794705782843 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`orders\`(
        \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, 
        \`unique_id\` VARCHAR(36) NOT NULL, 
        \`idempotency_key\` VARCHAR(36) NOT NULL, 
        \`buyer_name\` VARCHAR(128) NOT NULL, 
        \`buyer_email\` VARCHAR(188) NOT NULL,
        \`buyer_snapshot\` JSON NULL DEFAULT NULL,
        \`status\` VARCHAR(24) NOT NULL,
        \`grand_total\` DECIMAL(24, 8) NOT NULL,
        \`placed_at\` BIGINT NOT NULL,
        \`created_at\` BIGINT NOT NULL,
        \`updated_at\` BIGINT NULL DEFAULT NULL, 
        PRIMARY KEY(\`id\`), UNIQUE(\`unique_id\`), UNIQUE(\`idempotency_key\`)) 
        ENGINE = InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`orders\``);
  }

}
