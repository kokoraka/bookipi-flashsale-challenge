import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrdersPromotionKey1794743059461 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`orders\` 
        ADD \`promotion_key\` VARCHAR(36) NULL DEFAULT NULL AFTER \`buyer_snapshot\`,
        ADD CONSTRAINT \`cuk_buyer_promotion_email\` UNIQUE(\`promotion_key\`, \`buyer_email\`);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`orders\`
        DROP \`promotion_key\`,
        DROP INDEX \`cuk_buyer_promotion_email\`;
    `);
  }

}
