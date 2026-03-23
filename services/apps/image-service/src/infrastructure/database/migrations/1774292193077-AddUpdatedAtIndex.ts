import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtIndex1774292193077 implements MigrationInterface {
    name = 'AddUpdatedAtIndex1774292193077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_updated_at" ON "images" ("updated_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_updated_at"`);
    }

}
