import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertDefaultProducts1794981930859 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const currentTs = new Date().getTime()
    await queryRunner.query(`
      INSERT INTO \`products\` (
          \`unique_id\`,
          \`name\`,
          \`description\`,
          \`thumbnail\`,
          \`selling_price\`,
          \`available_quantity\`,
          \`created_at\`,
          \`updated_at\`
      ) SELECT
          '01a1dd34-b2fc-7fa1-b7e1-b98267225dfa',
          'Banana',
          'Yellow banana',
          '{\"provider\":\"local\",\"file\":{\"public_url\":\"https://learn.kotoenglish.com/wp-content/uploads/2025/05/Banana-Definition.webp\"}}',
          '23.99',
          '20000',
          ` + currentTs + `,
          NULL
      WHERE NOT EXISTS (
          SELECT 1 FROM \`products\`
          WHERE \`unique_id\` = '01a1dd34-b2fc-7fa1-b7e1-b98267225dfa'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // @note: do nothing
  }

}
