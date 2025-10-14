import { QueryRunner } from 'typeorm'
import { SqliteMigration } from '../sqlite.migration'

export class isActive20251014000000 extends SqliteMigration {
  name = 'isActive20251014000000'

  public async realUp(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "form" ADD COLUMN "is_active" boolean DEFAULT 1')
    await queryRunner.query('UPDATE "form" SET "is_active" = 1 WHERE "is_active" IS NULL')
  }

  public async realDown(queryRunner: QueryRunner): Promise<void> {
    // No-op: dropping a column in SQLite requires table recreation which is
    // highly schema-specific. Leaving the column in place on downgrade.
  }
}


