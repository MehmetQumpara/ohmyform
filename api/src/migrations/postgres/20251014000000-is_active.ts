import { MigrationInterface, QueryRunner } from 'typeorm'

export class isActive20251014000000 implements MigrationInterface {
  name = 'isActive20251014000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "form" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true')
    // ensure existing rows are active
    await queryRunner.query('UPDATE "form" SET "is_active" = true WHERE "is_active" IS NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "form" DROP COLUMN "is_active"')
  }
}


