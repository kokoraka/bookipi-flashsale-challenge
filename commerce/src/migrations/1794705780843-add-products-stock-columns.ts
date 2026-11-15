import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductsStockColumns1794708646204 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`products\` 
        ADD \`available_quantity\` DECIMAL(20, 8) NOT NULL DEFAULT '0' AFTER \`selling_price\`;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`products\`
        DROP \`balance_quantity\`;
    `);
  }

}
