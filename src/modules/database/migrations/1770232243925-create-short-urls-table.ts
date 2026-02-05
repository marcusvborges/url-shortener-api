import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShortUrlsTable1770232243925 implements MigrationInterface {
  name = 'CreateShortUrlsTable1770232243925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "short_urls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "code" character varying(6) NOT NULL, "originalUrl" text NOT NULL, "clicks" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0bee0ef97594699927c1b7c81a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_36d7fc390c3e722f91a4683883" ON "short_urls" ("code") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36d7fc390c3e722f91a4683883"`,
    );
    await queryRunner.query(`DROP TABLE "short_urls"`);
  }
}
