import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateImagesTable1710255600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "images_status_enum" AS ENUM('PENDING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED')`,
    );
    await queryRunner.createTable(
      new Table({
        name: "images",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "original_s3_key",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "processed_s3_key",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enumName: "images_status_enum",
            default: "'PENDING'",
          },
          {
            name: "width",
            type: "int",
            isNullable: true,
          },
          {
            name: "height",
            type: "int",
            isNullable: true,
          },
          {
            name: "attempts",
            type: "int",
            default: 0,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("images");
    await queryRunner.query(`DROP TYPE "images_status_enum"`);
  }
}
