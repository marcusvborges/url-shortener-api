import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerOriginalUrlUnique1770398075500 implements MigrationInterface {
  name = 'AddOwnerOriginalUrlUnique1770398075500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_short_urls_owner_original" ON "short_urls" ("ownerId", "originalUrl") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_short_urls_owner_original"`,
    );
  }
}
