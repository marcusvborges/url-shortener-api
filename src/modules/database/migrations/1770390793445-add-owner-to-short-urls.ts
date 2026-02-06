import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerToShortUrls1770390793445 implements MigrationInterface {
  name = 'AddOwnerToShortUrls1770390793445';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "short_urls" ADD "ownerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "short_urls" ADD CONSTRAINT "FK_c4ed8864d0568d5eb06ce6b1050" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "short_urls" DROP CONSTRAINT "FK_c4ed8864d0568d5eb06ce6b1050"`,
    );
    await queryRunner.query(`ALTER TABLE "short_urls" DROP COLUMN "ownerId"`);
  }
}
