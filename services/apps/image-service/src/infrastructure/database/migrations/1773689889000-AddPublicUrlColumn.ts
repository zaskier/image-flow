import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPublicUrlColumn1773689889000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "images",
      new TableColumn({
        name: "public_url",
        type: "varchar",
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("images", "public_url");
  }
}
